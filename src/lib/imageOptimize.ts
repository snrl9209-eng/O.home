'use client';
// 이미지 업로드 최적화 — PNG 등을 업로드 직전 WebP로 재인코딩해 용량을 줄인다.
// putBlob() 안에서 한 줄로 불러 쓴다. 원본 저장소에 없는 파일이라
// [Sync fork]로 새 버전을 받아도 이 파일은 절대 덮어써지거나 충돌하지 않는다.

/** 손대지 않고 그대로 둘 타입 — gif(움짤은 변환하면 애니메이션이 깨짐), svg(벡터),
 *  webp(이미 변환된 파일), 이미지가 아닌 파일(폰트·텍스트 등) */
function shouldSkip(type: string): boolean {
  return !type.startsWith('image/') || type.includes('gif') || type.includes('svg') || type.includes('webp');
}

/** WebP 화질(0~1). 1에 가까울수록 원본에 가깝고 용량 절감폭은 줄어든다.
 *  0.92면 육안으로는 원본과 거의 구별되지 않으면서 PNG 대비 용량이 크게 준다.
 *  브라우저 캔버스 API는 무손실(lossless) WebP 옵션을 지원하지 않아,
 *  "화질 유지 + 최대 압축"은 이 값을 1에 가깝게 두는 것으로 근사한다. */
const WEBP_QUALITY = 0.92;

/**
 * 이미지 Blob을 WebP로 재인코딩해서 돌려준다.
 * 변환 실패, 또는 변환 결과가 오히려 더 크면 원본을 그대로 돌려준다(안전장치).
 */
export async function optimizeImage(blob: Blob): Promise<Blob> {
  if (shouldSkip(blob.type)) return blob;

  try {
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return blob;
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    const webp = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY)
    );
    if (!webp) return blob;

    return webp.size < blob.size ? webp : blob;
  } catch {
    return blob; // 변환 실패 시 원본 그대로 업로드 — 업로드 자체를 막지는 않는다
  }
}
