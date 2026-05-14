/**
 * 개발(로컬): playwright-core + 시스템 Chrome
 * 프로덕션(Vercel): playwright-core + @sparticuz/chromium
 */

export async function launchBrowser(extraArgs = {}) {
  const { chromium } = await import('playwright-core');

  if (process.env.NODE_ENV === 'development') {
    // 로컬 개발: CHROMIUM_PATH 환경변수가 있으면 사용, 없으면 channel: 'chrome'
    const executablePath = process.env.CHROMIUM_PATH || undefined;
    return chromium.launch({
      headless: true,
      ...(executablePath ? { executablePath } : { channel: 'chrome' }),
      ...extraArgs,
    });
  }

  // 프로덕션: @sparticuz/chromium 사용
  const chromiumBin = (await import('@sparticuz/chromium')).default;
  return chromium.launch({
    args: chromiumBin.args,
    defaultViewport: chromiumBin.defaultViewport,
    executablePath: await chromiumBin.executablePath(),
    headless: chromiumBin.headless,
    ...extraArgs,
  });
}

export async function launchFirefoxBrowser() {
  // Firefox 바이너리는 Vercel에서 사용 불가 → 개발 환경에서만 지원
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Firefox는 로컬 개발 환경에서만 지원됩니다. Vercel에서는 Chrome 기반 브라우저를 사용해주세요.');
  }
  const { firefox } = await import('playwright-core');
  return firefox.launch({ headless: true });
}
