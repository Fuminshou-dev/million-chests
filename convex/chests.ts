import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
    const chest = await ctx.db
      .query("chests")
      .withIndex("by_index", (q) => q.eq("index", args.index))
      .first();
    if (chest) {
      return;
    }
    await ctx.db.insert("chests", {
      index: args.index,
      isOpen: true,
    });
    const goldChest = DISCOUNTS.find((c) => c.index === args.index);
    if (goldChest) {
      return goldChest.code;
    }
  },
});

export const getChests = query({
  args: {
    index: v.number(),
  },
  async handler(ctx, args) {
    const chest = await ctx.db
      .query("chests")
      .withIndex("by_index", (q) => q.eq("index", args.index))
      .first();
    if (!chest) {
      return null;
    }
    return { ...chest, isGold: DISCOUNTS.some((c) => c.index === chest.index) };
  },
});
