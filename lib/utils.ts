import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const luDecomposition = (A: { name: string; value: number }[][]) => {
  const n = A.length;
  const L = Array.from({ length: n }, () => Array(n).fill(0));
  const U = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      // Заполняем U
      if (j >= i) {
        U[i][j] = A[i][j].value;
        for (let k = 0; k < i; k++) {
          U[i][j] -= L[i][k] * U[k][j];
        }
      }

      // Заполняем L
      if (j < i) {
        L[i][j] = A[i][j].value;
        for (let k = 0; k < j; k++) {
          L[i][j] -= L[i][k] * U[k][j];
        }
        L[i][j] /= U[j][j];
      }
    }
    L[i][i] = 1; // Диагональные элементы L равны 1
  }

  return { L, U };
};

// Функция для решения СЛАУ с помощью LU-разложения
export const solveLU = (
  A: { name: string; value: number }[][],
  b: { name: string; value: number }[]
) => {
  const { L, U } = luDecomposition(A);
  const n = b.length;

  // Решение Ly = b
  const y = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    y[i] = b[i].value;
    for (let j = 0; j < i; j++) {
      y[i] -= L[i][j] * y[j];
    }
  }

  // Решение Ux = y
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = y[i];
    for (let j = i + 1; j < n; j++) {
      x[i] -= U[i][j] * x[j];
    }
    x[i] /= U[i][i];
  }

  return x;
};

export const determinantLU = (L: number[][], U: number[][]) => {
  let determinantL = 1;
  for (let i = 0; i < L.length; i++) {
    determinantL *= L[i][i];
  }

  let determinantU = 1;
  for (let k = 0; k < U.length; k++) {
    determinantU *= U[k][k];
  }

  return determinantL * determinantU;
};
