/**
 * Adds integers contained within strings
 * @param string1 The first string addend
 * @param string2 The second string addend
 * @returns String Result of addition
*/
export function strNumericAdd(string1, string2)
{
    return (parseInt(string1) + parseInt(string2)).toString()
}

export function extractToken(string) {
    const prefix = "dist:";
    const startIndex = string.indexOf(prefix);
  
    if (startIndex !== -1) {
      // Find the start position of the token
      const tokenStart = startIndex + prefix.length;
      // Find the end position of the token (next space after the token, or end of string if no space found)
      let tokenEnd = string.indexOf(" ", tokenStart);
      tokenEnd = tokenEnd === -1 ? string.length : tokenEnd; // If no space found, use the end of the string
      
      // Extract the token
      const token = string.substring(tokenStart, tokenEnd);
      console.log("found token: " + token)
      return token;
    }
  
    // Return null or an empty string if the prefix "dist:token " is not found
    return null;
  }
  
export function removeDistToken(string, search_token) {
    const prefix = "dist:" + search_token;
    const startIndex = string.indexOf(prefix);
  
    if (startIndex !== -1) {
      // Find the start position of the token
      const tokenStart = startIndex + prefix.length;
      // Find the end position of the token (next space after the token, or end of string if no space found)
      let tokenEnd = string.indexOf(" ", tokenStart);
      tokenEnd = tokenEnd === -1 ? string.length : tokenEnd + 1; // Include the space after the token if it exists
      
      // Remove the "dist:token " and the token from the string
      const beforeToken = string.substring(0, startIndex);
      const afterToken = string.substring(tokenEnd, string.length);
      return beforeToken + afterToken;
    }
  
    // Return the original string if the prefix "dist:token " is not found
    return string;
}
