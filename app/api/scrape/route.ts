import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

// Define types for our scraped data
interface ScrapedData {
  url: string;
  title: string;
  links: string[];
  paragraphs: string[];
  scrapedAt: string;
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const url = (req.query.url as string) || 'https://example.com';

    const browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    const title = await page.title();

    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map(a => a.href);
    });

    const paragraphs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('p')).map(p => p.textContent || '');
    });

    await browser.close();

    const scrapedData: ScrapedData = {
      url,
      title,
      links,
      paragraphs,
      scrapedAt: new Date().toISOString()
    };

    // Insert data into Supabase
    const { data, error } = await supabase
      .from('scraped_pages')
      .insert(scrapedData);

    if (error) {
      console.error('Error inserting data:', error);
      res.status(500).json({ error: 'Failed to insert data into Supabase' });
    } else {
      res.status(200).json({ message: 'Data scraped and inserted successfully', data: scrapedData });
    }
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ error: 'An error occurred while scraping' });
  }
}