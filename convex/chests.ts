import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { disconnect } from "process";

export const BITS_IN_PARTITION = 32;

const DISCOUNTS = [
  {
    index: 1,
    code: "asdfas",
  },
  {
    index: 0,
    code: "asdfas",
  },
  {
    index: 5,
    code: "asdfas",
  },
  {
    index: 15,
    code: "asdfas",
  },
];

export const openChest = mutation({
  args: {
    index: v.number(),
  },
  async handler(ctx, args) {
    const partition = Math.floor(args.index / BITS_IN_PARTITION);
    const chestPartition = await ctx.db
      .query("chests")
      .withIndex("by_partition", (q) => q.eq("partition", partition))
      .first();

    if (!chestPartition) {
      await ctx.db.insert("chests", {
        partition,
        bitset: 1 << args.index % BITS_IN_PARTITION,
      });
    } else {
      chestPartition.bitset |= 1 << args.index % BITS_IN_PARTITION;
      await ctx.db.patch(chestPartition._id, { bitset: chestPartition.bitset });
    }
    const goldChest = DISCOUNTS.find((c) => c.index === args.index);
    if (goldChest) {
      return goldChest.code;
    }
  },
});

export const getChestsPartition = query({
  args: {
    partition: v.number(),
  },
  async handler(ctx, args) {
    const chestPartition = await ctx.db
      .query("chests")
      .withIndex("by_partition", (q) => q.eq("partition", args.partition))
      .first();
    if (!chestPartition) {
      return null;
    }
    return chestPartition;
  },
});

async function isChestOpen(ctx: QueryCtx, index: number) {
  const partition = Math.floor(index / BITS_IN_PARTITION);
  const bit = 1 << index % BITS_IN_PARTITION;
  const chestPartition = await ctx.db
    .query("chests")
    .withIndex("by_partition", (q) => q.eq("partition", partition))
    .first();
  return chestPartition ? (chestPartition.bitset & bit) !== 0 : false;
}

export const getGoldChests = query({
  async handler(ctx) {
    const chests = await Promise.all(
      DISCOUNTS.map(async (chest) => {
        return {
          isOpen: await isChestOpen(ctx, chest.index),
          index: chest.index,
        };
      })
    );
    const onlyOpenGoldChests = chests.filter((chest) => chest.isOpen);
    return onlyOpenGoldChests;
  },
});
