import { describe, it, expect } from "vitest";
import { extractWikiLinkTitles } from "./wikiLink.service.js";

describe("extractWikiLinkTitles", () => {
  it("extracts a single link", () => {
    expect(extractWikiLinkTitles("See [[Project Plan]] for details")).toEqual(["Project Plan"]);
  });

  it("extracts multiple distinct links", () => {
    expect(extractWikiLinkTitles("[[A]] and [[B]] and [[A]] again")).toEqual(["A", "B"]);
  });

  it("returns an empty array when there are no links", () => {
    expect(extractWikiLinkTitles("plain text, no links here")).toEqual([]);
  });

  it("trims whitespace inside the brackets", () => {
    expect(extractWikiLinkTitles("[[  Spaced Title  ]]")).toEqual(["Spaced Title"]);
  });

  it("ignores empty double-bracket pairs", () => {
    expect(extractWikiLinkTitles("[[]] and [[Valid]]")).toEqual(["Valid"]);
  });
});
