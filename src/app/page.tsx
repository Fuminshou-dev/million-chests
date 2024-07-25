"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import React, { useState } from "react";
import { BITS_IN_PARTITION } from "../../convex/chests";
import { FixedSizeGrid as Grid } from "react-window";
import { useMeasure } from "react-use";
const NUMBER_OF_CHESTS = 1_000_000;
const COLUMN_WIDTH = 100;
const ROW_HEIGHT = 100;

function Chest({
  rowIndex,
  columnIndex,
  style,
  data,
}: {
  rowIndex: number;
  columnIndex: number;
  style: React.CSSProperties;
  data: { columnCount: number; onCodeFound: (code: string) => void };
}) {
  const index = rowIndex * data.columnCount + columnIndex;
  const goldChests = useQuery(api.chests.getOpenGoldChests) || [];
  const partitionIndex = Math.floor(index / BITS_IN_PARTITION);
  const openChest = useMutation(api.chests.openChest).withOptimisticUpdate(
    (localStore, args) => {
      const currentValue = localStore.getQuery(api.chests.getChestsPartition, {
        partition: partitionIndex,
      });
      if (currentValue) {
        localStore.setQuery(
          api.chests.getChestsPartition,
          {
            partition: partitionIndex,
          },
          {
            ...currentValue,
            bitset: currentValue.bitset | (1 << index % BITS_IN_PARTITION),
          }
        );
      }
    }
  );
  const chestsPartition = useQuery(api.chests.getChestsPartition, {
    partition: Math.floor(index / BITS_IN_PARTITION),
  });

  const bit = 1 << index % BITS_IN_PARTITION;
  const isOpen = chestsPartition ? (chestsPartition.bitset & bit) !== 0 : false;
  if (index >= NUMBER_OF_CHESTS) {
    return null;
  }
  return (
    <div style={style}>
      <button
        key={index}
        disabled={isOpen}
        onClick={() => {
          openChest({ index }).then((code) => {
            if (code) {
              data.onCodeFound(code);
            }
          });
        }}
        className="w-24 h-24 btn"
      >
        {isOpen ? (
          goldChests.some((c) => c.index === index) ? (
            <img src="/chest-gold.png" alt="chest" />
          ) : (
            <img src="/chest-empty.png" alt="chest" />
          )
        ) : (
          <img src="/chest.png" alt="chest" />
        )}
      </button>
    </div>
  );
}
export default function Home() {
  const openedChests = useQuery(api.sums.getOpenBoxSum) ?? 0;
  const [code, setCode] = useState(window.localStorage.getItem(`code`));
  const [ref, { width, height }] = useMeasure<HTMLDivElement>();
  return (
    <main className="flex min-h-screen flex-col items-center justify-between whitespace-nowrap overflow-auto  scrollbar-hide">
      <h1 className="font-medium text-2xl">{NUMBER_OF_CHESTS} CHESTS</h1>
      {code && <p className="text-red-600">You found a code {code}</p>}

      <p className="text-xl">
        {openedChests} of {NUMBER_OF_CHESTS} opened
      </p>
      <div
        ref={ref}
        className="w-screen h-screen whitespace-nowrap overflow-y-scroll overflow-auto scrollbar-hide"
      >
        <Grid
          className="scrollbar-hide"
          columnCount={Math.floor(width / COLUMN_WIDTH)}
          columnWidth={COLUMN_WIDTH}
          height={height}
          width={width}
          rowCount={NUMBER_OF_CHESTS / Math.floor(width / COLUMN_WIDTH)}
          rowHeight={ROW_HEIGHT}
          itemData={{
            columnCount: Math.floor(width / COLUMN_WIDTH),
            onCodeFound(code: string) {
              setCode(code);
              window.localStorage.setItem(`code`, code);
              alert(`You found a code: ${code}`);
            },
          }}
        >
          {Chest}
        </Grid>
      </div>
    </main>
  );
}
