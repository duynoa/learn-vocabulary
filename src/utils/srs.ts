import type { Progress } from '@/types';

/**
 * Chu kỳ lặp lại ngắt quãng (Spaced Repetition System - SRS):
 * - Chu kỳ 1 (thuộc lần 1): 1 ngày (24 giờ)
 * - Chu kỳ 2 (thuộc lần 2): 3 ngày (72 giờ)
 * - Chu kỳ 3 trở đi: 7 ngày (168 giờ)
 */
export function getSRSIntervalDays(reviewCount: number): number {
  if (reviewCount <= 5) return 1;
  if (reviewCount <= 10) return 3;
  return 7;
}

/**
 * Kiểm tra xem từ đã thuộc có bị quá hạn (cần ôn lại) hay chưa.
 */
export function isProgressExpired(progress?: Progress | null): boolean {
  if (!progress || progress.status !== 'mastered' || !progress.last_reviewed_at) {
    return false;
  }

  const lastReviewedTime = new Date(progress.last_reviewed_at).getTime();
  if (Number.isNaN(lastReviewedTime)) {
    return false;
  }

  const intervalDays = getSRSIntervalDays(progress.review_count);
  const intervalMs = intervalDays * 24 * 60 * 60 * 1000;
  return Date.now() - lastReviewedTime >= intervalMs;
}

/**
 * Lấy mô tả thời gian còn lại trước khi từ cần được ôn lại.
 */
export function getRemainingReviewTime(progress?: Progress | null): string {
  if (!progress || progress.status !== 'mastered' || !progress.last_reviewed_at) {
    return '';
  }

  const lastReviewedTime = new Date(progress.last_reviewed_at).getTime();
  const intervalDays = getSRSIntervalDays(progress.review_count);
  const intervalMs = intervalDays * 24 * 60 * 60 * 1000;
  const dueTime = lastReviewedTime + intervalMs;
  const remainingMs = dueTime - Date.now();

  if (remainingMs <= 0) {
    return 'Cần ôn lại ngay';
  }

  const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
  if (remainingHours < 24) {
    return `Ôn lại sau ${remainingHours} giờ`;
  }

  const remainingDays = Math.ceil(remainingHours / 24);
  return `Ôn lại sau ${remainingDays} ngày`;
}
