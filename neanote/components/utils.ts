// QuickSort function
export function quicksort<T>(arr: T[], comparator: (a: T, b: T) => number): T[] {
    if (arr.length <= 1) {
      return arr;
    }

    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter(item => comparator(item, pivot) < 0);
    const right = arr.filter(item => comparator(item, pivot) > 0);
    const middle = arr.filter(item => comparator(item, pivot) === 0);

    return [...quicksort(left, comparator), ...middle, ...quicksort(right, comparator)]; // recursion
  }
