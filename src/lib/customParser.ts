/* import Parser from "rss-parser";

// Define the CustomItem interface
export interface CustomItem extends Parser.Item {
  guid: string; // Make guid required
  Tags?: string;
  CategoryID?: string;
  SubCategoryID?: string;
}

// Define the CustomOutput type
export type CustomOutput = Parser.Output<CustomItem>;

// Define the CustomParser type
export type CustomParser = Parser<CustomOutput, CustomItem>;

// Create and export the customParser instance
export const customParser: CustomParser = new Parser({
  customFields: {
    item: ["Tags", "CategoryID", "SubCategoryID"],
  },
});
 */

import Parser from "rss-parser";

// Define the CustomItem interface
export interface CustomItem extends Parser.Item {
  guid: string;
  Tags?: string;
  CategoryID?: string;
  SubCategoryID?: string;
  UpdateDate?: string;
  pubDate?: string;
}

// Define the CustomOutput type
export type CustomOutput = Parser.Output<CustomItem>;

// Define the CustomParser type
export type CustomParser = Parser<CustomOutput, CustomItem>;

// Helper function to convert date strings to ISO format
function toISOString(dateString: string): string {
  return new Date(dateString).toISOString();
}

// Create and export the customParser instance
export const customParser: CustomParser = new Parser({
  customFields: {
    item: ["Tags", "CategoryID", "SubCategoryID", "UpdateDate", "pubDate"],
  },
});

// Function to post-process the parsed items
export function postProcessItems(items: CustomItem[]): CustomItem[] {
  return items.map((item) => ({
    ...item,
    pubDate: item.pubDate ? toISOString(item.pubDate) : undefined,
    UpdateDate: item.UpdateDate ? toISOString(item.UpdateDate) : undefined,
  }));
}
