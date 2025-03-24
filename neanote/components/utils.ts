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

// Binary search function
export function binarySearch<T>(
  arr: T[], 
  target: T, 
  comparator: (a: T, b: T) => number
): number {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const compareResult = comparator(arr[mid], target);

    if (compareResult === 0) {
      return mid; // Found the element
    } else if (compareResult < 0) {
      low = mid + 1; // Search in the right half
    } else {
      high = mid - 1; // Search in the left half
    }
  }

  return -1; // Element not found
}
