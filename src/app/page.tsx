"use client";
import { useMutation, useQuery } from "convex/react";
import Image from "next/image";
import { api } from "../../convex/_generated/api";
const NUMBER_OF_CHESTS = 100;

function Chest({ index }: { index: number }) {
  const openChest = useMutation(api.chests.openChest);
  const chest = useQuery(api.chests.getChests, { index });
  const isOpen = chest?.isOpen;
  return (
    <button
      disabled={isOpen}
      onClick={() => {
        openChest({ index });
      }}
      className="w-24 h-24 btn"
      key={index}
    >
      {isOpen ? (
        <img src="/chest-empty.png" alt="chest" />
      ) : (
        <img src="/chest.png" alt="chest" />
      )}
    </button>
  );
}
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <h1 className="font-medium text-2xl">ONE MILLION CHESTS</h1>
      <p className="text-xl">
        {1} of {NUMBER_OF_CHESTS} opened
      </p>
      <div className="flex flex-wrap gap-2">
        {new Array(NUMBER_OF_CHESTS).fill(null).map((_, index) => (
          <Chest index={index} key={index} />
        ))}
      </div>
    </main>
  );
}
