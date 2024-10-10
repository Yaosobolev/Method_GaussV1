"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { determinantLU, luDecomposition, solveLU } from "@/lib/utils";
const A = [
  [
    { name: "x1", value: 8 },
    { name: "x2", value: 11 },
    { name: "x3", value: -1 },
    { name: "x4", value: -0.07 },
  ],
  [
    { name: "x1", value: 4.056 },
    { name: "x2", value: 0.3 },
    { name: "x3", value: -5.3 },
    { name: "x4", value: 0.11 },
  ],
  [
    { name: "x1", value: 0.2 },
    { name: "x2", value: 5.77 },
    { name: "x3", value: 2.8 },
    { name: "x4", value: -15 },
  ],
  [
    { name: "x1", value: 12 },
    { name: "x2", value: -3.8 },
    { name: "x3", value: 1 },
    { name: "x4", value: 3 },
  ],
];

// const b = [
//   { name: "b", value: 0.654 },
//   { name: "b", value: -24.016 },
//   { name: "b", value: 54.567 },
//   { name: "b", value: -64.78 },
// ];

export default function Home() {
  const [straightMoveA, setStraightMoveA] = useState<
    { name: string; value: number }[][]
  >([
    [
      { name: "x1", value: 8 },
      { name: "x2", value: 11 },
      { name: "x3", value: -1 },
      { name: "x4", value: -0.07 },
    ],
    [
      { name: "x1", value: 4.056 },
      { name: "x2", value: 0.3 },
      { name: "x3", value: -5.3 },
      { name: "x4", value: 0.11 },
    ],
    [
      { name: "x1", value: 0.2 },
      { name: "x2", value: 5.77 },
      { name: "x3", value: 2.8 },
      { name: "x4", value: -15 },
    ],
    [
      { name: "x1", value: 12 },
      { name: "x2", value: -3.8 },
      { name: "x3", value: 1 },
      { name: "x4", value: 3 },
    ],
  ]);

  const [straightMoveB, setStraightMoveB] = useState<
    { name: string; value: number }[]
  >([
    { name: "b", value: 0.654 },
    { name: "b", value: -24.016 },
    { name: "b", value: 54.567 },
    { name: "b", value: -64.78 },
  ]);

  const [straightMoveArray, setStraightMoveArray] = useState<
    { name: string; value: number }[][]
  >([]);

  const [reverseMoveArray, setReverseMoveArray] = useState<
    { name: string; value: number }[]
  >([]);

  const [solutionError, serSolutionError] = useState({
    disturbedRightSide: [] as number[],
    vectorB: [] as number[],
    euclideanNormOfVectorB: 0,
    euclideanNormOfB: 0,
    fault: 0,
  });

  const [firstElementRows, setFirstElementRows] = useState<number[]>([]);
  const [straightMoveDeterminantMatrix, setStraightMoveDeterminantMatrix] =
    useState<{ name: string; value: number }[][]>([]);
  const [determinantMatrix, setDeterminantMatrix] = useState(0);

  // const [extendedMatrix, setExtendedMatrix] = useState<
  //   { name: string; value: number }[][]
  // >([]);
  const [reverseMatrix, setReverseMatrix] = useState<
    { name: string; value: number }[][]
  >([]);

  const [lMatrix, setLMatrix] = useState<number[][]>([]);
  const [uMatrix, setUMatrix] = useState<number[][]>([]);
  const [lUMatrix, setLUMatrix] = useState<number[]>([]);

  const [determinantMatrixLU, setDeterminantMatrixLU] = useState(0);

  const combineArrays = () => {
    return straightMoveA.map((row, index) => {
      return [...row, straightMoveB[index]];
    });
  };

  function findMaxInMatrix(
    step: number,
    matrix: { name: string; value: number }[][],
    vector?: { name: string; value: number }[]
  ) {
    let maxRow = 0;
    let maxCol = 0;
    let max = 0;

    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        if (Math.abs(matrix[i][j].value) > Math.abs(max)) {
          max = matrix[i][j].value;
          maxRow = i;
          maxCol = j;
        }
      }
    }

    [matrix[step], matrix[maxRow]] = [matrix[maxRow], matrix[step]];
    if (vector) {
      [vector[step], vector[maxRow]] = [vector[maxRow], vector[step]];
    }

    for (let i = 0; i < matrix.length; i++) {
      const temp = matrix[i][step];
      matrix[i][step] = matrix[i][maxCol];
      matrix[i][maxCol] = temp;
    }

    return { matrix, vector, max, maxRow, maxCol };
  }

  function calcStraightMove(
    step: number,
    matrix: { name: string; value: number }[][],
    vector?: { name: string; value: number }[]
  ) {
    const firstElement = matrix[step][step].value;

    for (let i = step; i < matrix.length; i++) {
      const firstElementCurrentRow = matrix[i][step].value;

      for (let j = step; j < matrix[i].length; j++) {
        if (i === step) {
          if (vector && j === step) {
            vector[i].value /= firstElement;
          }
          matrix[i][j].value /= firstElement;
        }

        if (i !== step) {
          if (vector && j === step) {
            vector[i].value =
              vector[i].value - vector[step].value * firstElementCurrentRow;
          }
          matrix[i][j].value =
            matrix[i][j].value - matrix[step][j].value * firstElementCurrentRow;
        }
      }
    }
    if (vector) {
      setStraightMoveA(matrix);
      setStraightMoveB(vector);
    } else {
      setReverseMatrix(matrix.map((row) => row.slice(matrix.length)));
    }
    return matrix;
  }

  // function invertMatrix(extendedMatrix: { name: string; value: number }[][]) {
  //   const n = extendedMatrix.length;

  //   // Применяем метод Гаусса
  //   for (let step = 0; step < n; step++) {
  //     // Выбор ведущего элемента
  //     let maxRow = step;
  //     for (let i = step + 1; i < n; i++) {
  //       if (
  //         Math.abs(extendedMatrix[i][step].value) >
  //         Math.abs(extendedMatrix[maxRow][step].value)
  //       ) {
  //         maxRow = i;
  //       }
  //     }

  //     // Перестановка строк
  //     if (maxRow !== step) {
  //       [extendedMatrix[step], extendedMatrix[maxRow]] = [
  //         extendedMatrix[maxRow],
  //         extendedMatrix[step],
  //       ];
  //     }

  //     // Нормализация ведущей строки
  //     const pivot = extendedMatrix[step][step].value;

  //     for (let j = 0; j < extendedMatrix[step].length; j++) {
  //       extendedMatrix[step][j].value /= pivot;
  //     }

  //     // Обнуление остальных строк
  //     for (let i = 0; i < n; i++) {
  //       if (i !== step) {
  //         const factor = extendedMatrix[i][step].value;
  //         for (let j = 0; j < extendedMatrix[i].length; j++) {
  //           extendedMatrix[i][j].value -=
  //             factor * extendedMatrix[step][j].value;
  //         }
  //       }
  //     }
  //   }

  //   const inverseMatrix = extendedMatrix.map((row) => row.slice(n));
  //   setReverseMatrix(inverseMatrix);
  //   return inverseMatrix;
  // }
  function onSraightMove() {
    const n = straightMoveA.length;
    const extendedMatrix = A.map((row, i) => [
      ...row,
      ...Array(A.length)
        .fill(0)
        .map((_, j) => ({
          name: `a${j + 1}`,
          value: i === j ? 1 : 0,
        })),
    ]);

    // invertMatrix(extendedMatrix); //!!!!!!!!!!!!!!!

    for (let i = 0; i < n; i++) {
      const res = findMaxInMatrix(i, straightMoveA, straightMoveB);
      const firstElement = res.matrix[i][i].value;
      setFirstElementRows((prevRows) => [...prevRows, firstElement]);
      calcStraightMove(i, res.matrix, res.vector);
    }

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const res = findMaxInMatrix(j, extendedMatrix);
        calcStraightMove(j, res.matrix);
      }
    }

    const combineArraysRes = combineArrays();
    setStraightMoveArray([...combineArraysRes]);
  }

  function onReverseMove() {
    const solution = Array.from({ length: 4 }, (_, index) => ({
      name: `x${index + 1}`,
      value: 0,
    }));
    for (let i = straightMoveA.length - 1; i >= 0; i--) {
      solution[i].value = straightMoveB[i].value;
      for (let j = i + 1; j < straightMoveA.length; j++) {
        if (j < straightMoveA.length) {
          solution[i].value -= straightMoveA[i][j].value * solution[j].value;
        }
      }
      solution[i].value /= straightMoveA[i][i].value;
      solution[i].name = straightMoveA[i][i].name;
    }
    for (let i = 0; i < 2; i++) {
      setReverseMoveArray(
        solution.sort((a, b) => a.name.localeCompare(b.name))
      );
    }
  }

  function evaluateError() {
    const Aer = [
      [
        { name: "x1", value: 8 },
        { name: "x2", value: 11 },
        { name: "x3", value: -1 },
        { name: "x4", value: -0.07 },
      ],
      [
        { name: "x1", value: 4.056 },
        { name: "x2", value: 0.3 },
        { name: "x3", value: -5.3 },
        { name: "x4", value: 0.11 },
      ],
      [
        { name: "x1", value: 0.2 },
        { name: "x2", value: 5.77 },
        { name: "x3", value: 2.8 },
        { name: "x4", value: -15 },
      ],
      [
        { name: "x1", value: 12 },
        { name: "x2", value: -3.8 },
        { name: "x3", value: 1 },
        { name: "x4", value: 3 },
      ],
    ];

    const ber = [
      { name: "b", value: 0.654 },
      { name: "b", value: -24.016 },
      { name: "b", value: 54.567 },
      { name: "b", value: -64.78 },
    ];
    const disturbedRightSide = Aer.map((row) => {
      return row.reduce(
        (acc, val, j) => acc + Number(val.value) * reverseMoveArray[j]?.value,
        0
      );
    });

    const vectorB = ber.map((val, j) => val.value - disturbedRightSide[j]);

    const euclideanNormOfVectorB = Math.sqrt(
      vectorB.reduce((acc, val) => acc + val ** 2, 0)
    );
    const euclideanNormOfB = Math.sqrt(
      ber.reduce((acc, val) => acc + val.value ** 2, 0)
    );

    const fault = euclideanNormOfVectorB / euclideanNormOfB;
    serSolutionError({
      disturbedRightSide,
      vectorB,
      euclideanNormOfVectorB,
      euclideanNormOfB,
      fault,
    });
  }

  function determinant() {
    const getStraightMoveDeterminantMatrix = straightMoveArray.map(
      (row, rowIndex) =>
        row.map((item, itemIndex) => {
          const newItem = { ...item };

          if (rowIndex === itemIndex) {
            newItem.value = firstElementRows[rowIndex];
          }
          return newItem;
        })
    );

    setStraightMoveDeterminantMatrix([...getStraightMoveDeterminantMatrix]);

    const calcDeterminantMatrix = firstElementRows?.reduce(
      (acc, value) => acc * value,
      1
    );

    setDeterminantMatrix(calcDeterminantMatrix);
  }

  async function onCalculate() {
    try {
      onSraightMove();
      onReverseMove();
    } catch (error) {
      console.error("Ошибка:", error);
    }
  }

  const Am = [
    [
      { name: "x1", value: 8 },
      { name: "x2", value: 11 },
      { name: "x3", value: -1 },
      { name: "x4", value: -0.07 },
    ],
    [
      { name: "x1", value: 4.056 },
      { name: "x2", value: 0.3 },
      { name: "x3", value: -5.3 },
      { name: "x4", value: 0.11 },
    ],
    [
      { name: "x1", value: 0.2 },
      { name: "x2", value: 5.77 },
      { name: "x3", value: 2.8 },
      { name: "x4", value: -15 },
    ],
    [
      { name: "x1", value: 12 },
      { name: "x2", value: -3.8 },
      { name: "x3", value: 1 },
      { name: "x4", value: 3 },
    ],
  ];

  const bm = [
    { name: "b", value: 0.654 },
    { name: "b", value: -24.016 },
    { name: "b", value: 54.567 },
    { name: "b", value: -64.78 },
  ];

  useEffect(() => {
    evaluateError();
    determinant();
    const resLU = luDecomposition(Am);
    setLMatrix(resLU.L);
    setUMatrix(resLU.U);
    const resTotalLU = solveLU(Am, bm);
    setLUMatrix(resTotalLU);
  }, [straightMoveA, reverseMoveArray, firstElementRows, straightMoveArray]);
  useEffect(() => {
    const res = determinantLU(lMatrix, uMatrix);
    setDeterminantMatrixLU(res);
    console.log("res: ", res);
  }, [lMatrix, uMatrix]);

  return (
    <div className="flex flex-col gap-4">
      <div className="">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold">Уравнение:</h1>
          <Image height={350} width={350} alt="уравнение" src="/equation.png" />
        </div>
        <Button className="text-base mt-4" onClick={() => onCalculate()}>
          Вычислить
        </Button>
      </div>
      {straightMoveArray.length > 0 && (
        <div className="max-w-[800px]">
          <h2 className="text-xl mt-8">Прямой ход</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="">a1</TableHead>
                <TableHead>a2</TableHead>
                <TableHead className="text-center">a3</TableHead>
                <TableHead className="text-center">a4</TableHead>
                <TableHead className="text-center">b</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {straightMoveArray.map((el, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{el[0].value}</TableCell>
                    <TableCell>{el[1].value}</TableCell>
                    <TableCell className="text-center">{el[2].value}</TableCell>
                    <TableCell className="text-center">{el[3].value}</TableCell>
                    <TableCell className="text-center">{el[4].value}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <h2 className="text-xl mt-8">Обратный ход</h2>
          <Table className="max-w-[200px]">
            <TableBody>
              {reverseMoveArray.map((el, index) => {
                return (
                  <TableRow key={index} className="flex items-center">
                    <TableCell className="font-medium">{el.name}:</TableCell>
                    <span className="text-sm">=</span>
                    <TableCell className="font-medium">{el.value}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <h2 className="text-xl mt-8">
            Оценка погрешности полученного решения по правой части
          </h2>
          <Table className="min-w-[900px]">
            <TableBody>
              {solutionError && (
                <>
                  <TableRow className="flex items-center">
                    <TableCell className="font-medium">
                      <span className="text-sm">
                        {"b\u0303"} (Возмущенная правая часть)
                      </span>
                    </TableCell>
                    <span className="text-sm">=</span>
                    <TableCell className="font-medium flex gap-2">
                      {solutionError.disturbedRightSide.map((el, index) => {
                        return (
                          <span key={index}>
                            {el}
                            {index ===
                            solutionError.disturbedRightSide.length - 1
                              ? ""
                              : ","}
                          </span>
                        );
                      })}
                    </TableCell>
                  </TableRow>
                  <TableRow className="flex items-center">
                    <TableCell className="font-medium">
                      <span className="text-sm text-nowrap">
                        {"\u03B4"}b (Вектор b)
                      </span>
                    </TableCell>
                    <span className="text-sm">=</span>
                    <TableCell className="font-medium flex gap-2">
                      {solutionError.vectorB.map((el, index) => {
                        return (
                          <span key={index}>
                            {el}
                            {index === solutionError.vectorB.length - 1
                              ? ""
                              : ","}
                          </span>
                        );
                      })}
                    </TableCell>
                  </TableRow>
                  <TableRow className="flex items-center">
                    <TableCell className="font-medium">
                      <span className="text-sm">
                        ||{"\u03B4"}b|| (Eвклидовая норма вектор b)
                      </span>
                    </TableCell>
                    <span className="text-sm">=</span>
                    <TableCell className="font-medium">
                      {solutionError.euclideanNormOfVectorB}
                    </TableCell>
                  </TableRow>
                  <TableRow className="flex items-center">
                    <TableCell className="font-medium">
                      <span className="text-sm">
                        ||b|| (Eвклидовая норма правой части)
                      </span>
                    </TableCell>
                    <span className="text-sm">=</span>
                    <TableCell className="font-medium">
                      {solutionError.euclideanNormOfB}
                    </TableCell>
                  </TableRow>
                  <TableRow className="flex items-center">
                    <TableCell className="font-medium">
                      <span className="text-sm">
                        Погрешности полученного решения
                      </span>
                    </TableCell>
                    <span className="text-sm">=</span>
                    <TableCell className="font-medium">
                      {solutionError.fault}
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
          <h2 className="text-xl mt-8">Определителя матрицы</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="">a1</TableHead>
                <TableHead>a2</TableHead>
                <TableHead className="text-center">a3</TableHead>
                <TableHead className="text-center">a4</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {straightMoveDeterminantMatrix.map((el, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{el[0].value}</TableCell>
                    <TableCell>{el[1].value}</TableCell>
                    <TableCell className="text-center">{el[2].value}</TableCell>
                    <TableCell className="text-center">{el[3].value}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="text-sm font-medium mt-2">
            <span>det A</span>
            <span> = </span>
            <span>{determinantMatrix}</span>
          </div>
          <h2 className="text-xl mt-8">Обратная матрица</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="">a1</TableHead>
                <TableHead>a2</TableHead>
                <TableHead className="text-center">a3</TableHead>
                <TableHead className="text-center">a4</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reverseMatrix.map((el, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{el[0].value}</TableCell>
                    <TableCell>{el[1].value}</TableCell>
                    <TableCell className="text-center">{el[2].value}</TableCell>
                    <TableCell className="text-center">{el[3].value}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <h2 className="text-xl mt-8">Метод LU-разложения решения СЛАУ</h2>
          <h3 className="text-xl mt-8">L-матрица</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="">a1</TableHead>
                <TableHead>a2</TableHead>
                <TableHead className="text-center">a3</TableHead>
                <TableHead className="text-center">a4</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lMatrix.map((el, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{el[0]}</TableCell>
                    <TableCell>{el[1]}</TableCell>
                    <TableCell className="text-center">{el[2]}</TableCell>
                    <TableCell className="text-center">{el[3]}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <h3 className="text-xl mt-8">U-матрица</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="">a1</TableHead>
                <TableHead>a2</TableHead>
                <TableHead className="text-center">a3</TableHead>
                <TableHead className="text-center">a4</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uMatrix.map((el, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{el[0]}</TableCell>
                    <TableCell>{el[1]}</TableCell>
                    <TableCell className="text-center">{el[2]}</TableCell>
                    <TableCell className="text-center">{el[3]}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <h2 className="text-xl mt-8">Решение СЛАУ методом LU-разложения</h2>
          <Table className="max-w-[200px]">
            <TableBody>
              {lUMatrix.map((el, index) => {
                return (
                  <TableRow key={index} className="flex items-center">
                    <TableCell className="font-medium">
                      {`x${index + 1}`}:
                    </TableCell>
                    <span className="text-sm">=</span>
                    <TableCell className="font-medium">{el}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <h2 className="text-xl mt-8">
            Определителя матрицы методом LU-разложения
          </h2>
          <div className="text-sm font-medium mt-2">
            <span>det A</span>
            <span> = </span>
            <span>{determinantMatrixLU}</span>
          </div>
        </div>
      )}
    </div>
  );
}
