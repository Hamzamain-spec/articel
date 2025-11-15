export function cleanArticleText(text: string): string {
  let cleaned = text;
  
  // Remove title lines (matches "Title:", "The title of the article is", etc.)
  cleaned = cleaned.replace(/^.*?title.*?:.*$/gim, '');
  cleaned = cleaned.replace(/^.*?the title of the article is.*$/gim, '');
  
  // Remove curved apostrophes using Unicode escape sequences
  // \u2018 = ' (left single quotation mark)
  // \u2019 = ' (right single quotation mark)
  cleaned = cleaned.replace(/\u2018/g, '');
  cleaned = cleaned.replace(/\u2019/g, '');
  
  // Replace em-dash with space
  // \u2014 = — (em dash)
  cleaned = cleaned.replace(/\u2014/g, ' ');
  
  // Clean up multiple consecutive spaces (but preserve line breaks)
  cleaned = cleaned.replace(/[^\S\n]+/g, ' ');
  
  // Remove leading/trailing empty lines
  cleaned = cleaned.replace(/^\s+|\s+$/g, '');
  
  return cleaned.trim();
}
