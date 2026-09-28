export default async function run(page, ui) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    const el = document.querySelector('.strip-wrap');
    const r = el.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + r.top - (window.innerHeight - r.height) / 2);
  });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: 'D:/ziad/_filmstrip_en.png' });
  const rect = await page.evaluate(() => {
    const s = document.querySelector('.strip');
    const r = s.getBoundingClientRect();
    return { top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height), op: getComputedStyle(s).opacity };
  });
  await page.evaluate(() => document.querySelector('#langBtn').click());
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'D:/ziad/_filmstrip_ar.png' });
  return rect;
}
