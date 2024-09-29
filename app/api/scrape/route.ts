import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

interface JobDetails {
  letter: string;
  link: string;
  name: string;
  content: string;
}

export async function GET() {
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

    // Filter job links to start from 'G'
    const filteredJobLinks = jobLinks.filter(job => job.letter >= 'G');

    console.log(`Found ${filteredJobLinks.length} job links from G to Z`);

    const jobDetails: JobDetails[] = [];

    for (const item of filteredJobLinks) {
      if (item.link) {
        await page.goto(item.link, { waitUntil: 'networkidle0' });
        const content = await page.evaluate(() => document.body.innerText);
        jobDetails.push({
          letter: item.letter,
          link: item.link,
          name: item.name,
          content: content
        });
        console.log(`Scraped content for ${item.name} (${item.link})`);
      }
    }

    await browser.close();

    console.log(`Total job descriptions scraped: ${jobDetails.length}`);

    return NextResponse.json({
      message: `Scraped ${jobDetails.length} job descriptions from G to Z.`,
      jobDetails: jobDetails.map(({ letter, link, name }) => ({ letter, link, name }))
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: 'An error occurred while scraping' }, { status: 500 });
  }
}