import fs from 'fs';
import path from 'path';

function toCamelCase(str) {
    return str
        .toLowerCase()             
        .split(' ')                
        .map((word, index) =>      
            index === 0
                ? word             
                : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join('');                 
}

const camelCaseKeys = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(camelCaseKeys);
  }

  return Object.keys(obj).reduce((acc, key) => {

    const camelKey = toCamelCase(key)
    acc[camelKey] = camelCaseKeys(obj[key]);
    return acc;
  }, {});
};

// Function to extract only $value from a nested object
const extractValues = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(extractValues);
  }

  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    if (value && typeof value === 'object' && '$value' in value) {
      acc[key] = value['$value'];
    } else {
      acc[key] = extractValues(value);
    }
    return acc;
  }, {});
};

// Load JSON file
const filePath = path.resolve(new URL(import.meta.url).pathname, '../json/', 'demo.tokens.json');
const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Process JSON data
const processedData = Object.keys(jsonData).reduce((acc, theme) => {
  const camelCasedTheme = theme.toLowerCase();
  acc[camelCasedTheme] = extractValues(camelCaseKeys(jsonData[theme]));

  return acc;
}, {});

// Output the processed data to a new JSON file
const outputFilePath = path.resolve(new URL(import.meta.url).pathname, '../output/', 'final-theme.json');
fs.writeFileSync(outputFilePath, JSON.stringify(processedData, null, 2), 'utf8');

console.log('Theme JSON processed and saved to processed-theme.json');
