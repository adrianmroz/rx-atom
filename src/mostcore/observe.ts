import { runEffects, tap } from '@most/core';
import { newDefaultScheduler } from '@most/scheduler';
import { Unary } from './types';
import { Stream } from '@most/types';

export default function observe<T>(fn: Unary<T, void>, stream: Stream<T>) {
  runEffects(tap(fn, stream), newDefaultScheduler());
}
