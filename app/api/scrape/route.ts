import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

interface JobName {
  letter: string;
  name: string;
}

export async function GET() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.4cornerresources.com/job-descriptions/', { waitUntil: 'networkidle0' });

    const jobNames: JobName[] = [];

    for (let charCode = 65; charCode <= 90; charCode++) {
      const letter = String.fromCharCode(charCode);
      const sectionId = `a-z-listing-letter-${letter}-1`;

      const letterJobs = await page.evaluate((id, letter) => {
        const section = document.getElementById(id);
        if (!section) return [];

        const ul = section.querySelector('ul.az-columns.max-1-columns, ul.az-columns.max-2-columns, ul.az-columns.max-3-columns, ul.az-columns.max-4-columns, ul.az-columns.max-5-columns, ul.az-columns.max-6-columns');
        if (!ul) return [];

        const links = ul.querySelectorAll('li a');
        return Array.from(links).map(a => ({
          letter: letter,
          name: a.textContent?.trim() || ''
        }));
      }, sectionId, letter);

      jobNames.push(...letterJobs);
    }

    await browser.close();

    console.log(`Total job names scraped: ${jobNames.length}`);
    jobNames.forEach(job => {
      console.log(`${job.letter}: ${job.name}`);
    });

    return NextResponse.json({
      message: `Scraped ${jobNames.length} job names.`,
      jobNames: jobNames
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: 'An error occurred while scraping' }, { status: 500 });
  }
}