import Parser from "rss-parser";

// Define the CustomItem interface
export interface CustomItem extends Parser.Item {
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
