import { NextResponse } from 'next/server';
import { createClient } from "@/utils/supabase/server"
import puppeteer from 'puppeteer';

export const GET = async (req: Request) => {
    const supabase = createClient();

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto('https://www.4cornerresources.com/job-descriptions/', { waitUntil: 'networkidle0' });

        const jobLinks = await page.evaluate(() => {
            const links = document.querySelectorAll('.items-inner .letter-section ul.az-columns li a');
            return Array.from(links).map(a => ({
                letter: a.textContent?.trim().charAt(0).toUpperCase() || '',
                link: a.getAttribute('href') || '',
                name: a.textContent?.trim() || ''
            }));
        });

        console.log(`Found ${jobLinks.length} total job links`);

        const scrapedJobs = [];

        for (const item of jobLinks) {
            if (item.link && item.name) {
                try {
                    // Scrape job description
                    await page.goto(item.link, { waitUntil: 'networkidle0' });
                    const description = await page.evaluate(() => document.body.innerText);

                    if (!description) {
                        console.error('No description found for:', item.name);
                        continue;
                    }

                    // Insert job details
                    const { data, error } = await supabase.from("career").insert({
                        job_name: item.name,
                        job_desc: description
                    });

                    if (error) {
                        console.error('Error inserting job:', error.message || 'No error message', error.details || 'No error details');
                        // Log the whole error object for further debugging
                        console.error('Full error object:', error);
                        console.error('Failed item:', item);
                        continue;
                    } else {
                        console.log(`Scraped and inserted content for ${item.name} (${item.link})`);
                    }
                    
                    scrapedJobs.push({ name: item.name, link: item.link });
                } catch (itemError) {
                    console.error('Error processing item:', item);
                    console.error('Error details:', itemError);
                }
            } else {
                console.error('Invalid item:', item);
            }
        }

        await browser.close();

        console.log(`Scraping process completed`);

        return NextResponse.json({
            message: `Scraped and processed ${scrapedJobs.length} job descriptions.`,
            scrapedJobs: scrapedJobs
        });

    } catch (error) {
        console.error('Scraping error:', error);
        return NextResponse.json({ error: 'An error occurred while scraping' }, { status: 500 });
    }
};

export const dynamic = 'force-dynamic';
