"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Dispatch, SetStateAction, useState } from "react";
import { BITS_IN_PARTITION } from "../../convex/chests";
import { flushAllTraces } from "next/dist/trace";
const NUMBER_OF_CHESTS = 100;

function Chest({
  index,
  onCodeFound,
}: {
  index: number;
  onCodeFound: (code: string) => void;
}) {
  const goldChests = useQuery(api.chests.getGoldChests) || [];
  const openChest = useMutation(api.chests.openChest);
  const chestsPartition = useQuery(api.chests.getChestsPartition, {
    partition: Math.floor(index / BITS_IN_PARTITION),
  });
  const bit = 1 << index % BITS_IN_PARTITION;
  const isOpen = chestsPartition ? (chestsPartition.bitset & bit) !== 0 : false;
  return (
    <button
      disabled={isOpen}
      onClick={() => {
        openChest({ index }).then((code) => {
          if (code) {
            onCodeFound(code);
          }
        });
      }}
      className="w-24 h-24 btn"
      key={index}
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
  );
}
export default function Home() {
  const [code, setCode] = useState(window.localStorage.getItem(`code`));
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <h1 className="font-medium text-2xl">ONE MILLION CHESTS</h1>
      {code && <p className="text-red-600">You found a code {code}</p>}

      <p className="text-xl">
        {1} of {NUMBER_OF_CHESTS} opened
      </p>
      <div className="flex flex-wrap gap-2">
        {new Array(NUMBER_OF_CHESTS).fill(null).map((_, index) => (
          <Chest
            onCodeFound={(code) => {
              setCode(code);
              window.localStorage.setItem(`code`, code);
              alert(`You found a code: ${code}`);
            }}
            index={index}
            key={index}
          />
        ))}
      </div>
    </main>
  );
}
