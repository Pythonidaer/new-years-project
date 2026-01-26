import { describe, it, expect } from "vitest";
import { findFunctionBoundaries } from "../function-boundaries.js";

describe("function-boundaries", () => {
  describe("findFunctionBoundaries", () => {
    it("should return empty map for empty functions array", () => {
      const sourceCode = "function test() {}";
      const functions = [];
      const result = findFunctionBoundaries(sourceCode, functions);
      
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it("should find boundaries for simple named function", () => {
      const sourceCode = `function testFunction() {
  return true;
}`;
      const functions = [
        { line: 1, functionName: "testFunction", nodeType: "FunctionDeclaration" },
      ];
      const result = findFunctionBoundaries(sourceCode, functions);
      
      expect(result.size).toBe(1);
      const boundary = result.get(1);
      expect(boundary).toBeDefined();
      expect(boundary.start).toBe(1);
      expect(boundary.end).toBeGreaterThan(1);
    });

    it("should find boundaries for arrow function", () => {
      const sourceCode = `const testFunction = () => {
  return true;
};`;
      const functions = [
        { line: 1, functionName: "testFunction", nodeType: "ArrowFunctionExpression" },
      ];
      const result = findFunctionBoundaries(sourceCode, functions);
      
      expect(result.size).toBe(1);
      const boundary = result.get(1);
      expect(boundary).toBeDefined();
      expect(boundary.start).toBe(1);
      expect(boundary.end).toBeGreaterThan(1);
    });

    it("should find boundaries for arrow function with JSX return", () => {
      const sourceCode = `const Component = () => (
  <div>Hello</div>
);`;
      const functions = [
        { line: 1, functionName: "Component", nodeType: "ArrowFunctionExpression" },
      ];
      const result = findFunctionBoundaries(sourceCode, functions);
      
      expect(result.size).toBe(1);
      const boundary = result.get(1);
      expect(boundary).toBeDefined();
      expect(boundary.start).toBe(1);
      expect(boundary.end).toBeGreaterThanOrEqual(1);
    });

    it("should find boundaries for multiple functions", () => {
      const sourceCode = `function firstFunction() {
  return 1;
}

function secondFunction() {
  return 2;
}`;
      const functions = [
        { line: 1, functionName: "firstFunction", nodeType: "FunctionDeclaration" },
        { line: 5, functionName: "secondFunction", nodeType: "FunctionDeclaration" },
      ];
      const result = findFunctionBoundaries(sourceCode, functions);
      
      expect(result.size).toBe(2);
      const firstBoundary = result.get(1);
      const secondBoundary = result.get(5);
      expect(firstBoundary).toBeDefined();
      expect(secondBoundary).toBeDefined();
      expect(firstBoundary.end).toBeLessThan(secondBoundary.start);
    });

    it("should handle function with nested braces", () => {
      const sourceCode = `function testFunction() {
  if (true) {
    return true;
  }
  return false;
}`;
      const functions = [
        { line: 1, functionName: "testFunction", nodeType: "FunctionDeclaration" },
      ];
      const result = findFunctionBoundaries(sourceCode, functions);
      
      expect(result.size).toBe(1);
      const boundary = result.get(1);
      expect(boundary).toBeDefined();
      expect(boundary.end).toBeGreaterThan(1);
    });

    it("should handle arrow function on multiple lines", () => {
      const sourceCode = `const testFunction = 
  () => {
    return true;
  };`;
      const functions = [
        { line: 2, functionName: "testFunction", nodeType: "ArrowFunctionExpression" },
      ];
      const result = findFunctionBoundaries(sourceCode, functions);
      
      expect(result.size).toBe(1);
      const boundary = result.get(2);
      expect(boundary).toBeDefined();
      expect(boundary.start).toBeGreaterThanOrEqual(1);
      expect(boundary.end).toBeGreaterThan(boundary.start);
    });

    it("should handle function with TypeScript type annotations", () => {
      const sourceCode = `function testFunction(param: string): boolean {
  return true;
}`;
      const functions = [
        { line: 1, functionName: "testFunction", nodeType: "FunctionDeclaration" },
      ];
      const result = findFunctionBoundaries(sourceCode, functions);
      
      expect(result.size).toBe(1);
      const boundary = result.get(1);
      expect(boundary).toBeDefined();
      expect(boundary.end).toBeGreaterThan(1);
    });

    it("should handle export default function", () => {
      const sourceCode = `export default function testFunction() {
  return true;
}`;
      const functions = [
        { line: 1, functionName: "testFunction", nodeType: "FunctionDeclaration" },
      ];
      const result = findFunctionBoundaries(sourceCode, functions);
      
      expect(result.size).toBe(1);
      const boundary = result.get(1);
      expect(boundary).toBeDefined();
      expect(boundary.start).toBe(1);
    });

    it("should handle const arrow function assignment", () => {
      const sourceCode = `const testFunction = () => {
  return true;
};`;
      const functions = [
        { line: 1, functionName: "testFunction", nodeType: "ArrowFunctionExpression" },
      ];
      const result = findFunctionBoundaries(sourceCode, functions);
      
      expect(result.size).toBe(1);
      const boundary = result.get(1);
      expect(boundary).toBeDefined();
    });

    it("should handle function with default nodeType", () => {
      const sourceCode = `function testFunction() {
  return true;
}`;
      const functions = [
        { line: 1, functionName: "testFunction" }, // No nodeType specified
      ];
      const result = findFunctionBoundaries(sourceCode, functions);
      
      expect(result.size).toBe(1);
      const boundary = result.get(1);
      expect(boundary).toBeDefined();
    });

    describe("Arrow function edge cases", () => {
      it("should handle arrow function returning object literal", () => {
        const sourceCode = `const testFunction = () => ({ prop: 'value' });`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary).toBeDefined();
        expect(boundary.start).toBe(1);
        expect(boundary.end).toBe(1); // Object literal ends on same line
      });

      it("should handle arrow function returning object literal with semicolon", () => {
        const sourceCode = `const testFunction = () => ({ prop: 'value' });`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBe(1);
      });

      it("should handle arrow function inside JSX attribute", () => {
        const sourceCode = `<button onClick={(e) => handleClick(e)}>Click</button>`;
        const functions = [
          { line: 1, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBe(1); // Ends on same line
      });

      it("should handle arrow function inside JSX attribute with single expression", () => {
        const sourceCode = `<input onChange={(e) => setValue(e.target.value)} />`;
        const functions = [
          { line: 1, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBe(1);
      });

      it("should handle arrow function with JSX return spanning multiple lines", () => {
        const sourceCode = `const Component = () => (
  <div>
    <span>Hello</span>
  </div>
);`;
        const functions = [
          { line: 1, functionName: "Component", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.start).toBe(1);
        expect(boundary.end).toBeGreaterThan(1);
      });

      it("should handle arrow function with JSX return and closing parens", () => {
        const sourceCode = `const Component = () => (
  <div>Hello</div>
));`;
        const functions = [
          { line: 1, functionName: "Component", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThanOrEqual(3);
      });

      it("should handle arrow function with JSX return and closing brace", () => {
        const sourceCode = `const Component = () => (
  <div>Hello</div>
});`;
        const functions = [
          { line: 1, functionName: "Component", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThanOrEqual(3);
      });

      it("should handle single-expression arrow function", () => {
        const sourceCode = `const testFunction = () => true;`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBe(1);
      });

      it("should handle single-expression arrow function with comma", () => {
        const sourceCode = `const items = [1, 2, 3].map(item => item * 2,);`;
        const functions = [
          { line: 1, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBe(1);
      });

      it("should handle single-expression arrow function with closing paren", () => {
        const sourceCode = `const result = items.find(item => item.id === targetId);`;
        const functions = [
          { line: 1, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBe(1);
      });

      it("should handle arrow function spanning multiple lines without braces", () => {
        const sourceCode = `const testFunction = () =>
  someValue;`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });

      it("should handle arrow function in method call spanning multiple lines", () => {
        const sourceCode = `items.find(item =>
  item.id === targetId
);`;
        const functions = [
          { line: 1, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });

      it("should handle arrow function with dependency array (useEffect)", () => {
        const sourceCode = `useEffect(() => {
  console.log('mounted');
}, [deps]);`;
        const functions = [
          { line: 1, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });

      it("should handle arrow function with dependency array on same line", () => {
        const sourceCode = `useEffect(() => { console.log('mounted'); }, [deps]);`;
        const functions = [
          { line: 1, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThanOrEqual(1);
      });

      it("should handle arrow function with dependency array on next line", () => {
        const sourceCode = `useEffect(() => {
  console.log('mounted');
},
[deps]);`;
        const functions = [
          { line: 1, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });

      it("should handle setTimeout callback", () => {
        const sourceCode = `setTimeout(() => {
  console.log('timeout');
}, 1000);`;
        const functions = [
          { line: 1, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });

      it("should handle setTimeout callback with delay on same line", () => {
        const sourceCode = `setTimeout(() => { console.log('timeout'); }, 1000);`;
        const functions = [
          { line: 1, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThanOrEqual(1);
      });

      it("should handle arrow function with body brace on next line", () => {
        const sourceCode = `const testFunction = () =>
{
  return true;
};`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.start).toBeGreaterThanOrEqual(1);
        expect(boundary.end).toBeGreaterThan(boundary.start);
      });

      it("should handle arrow function when => is on previous line", () => {
        const sourceCode = `const testFunction =
  () => {
    return true;
  };`;
        const functions = [
          { line: 2, functionName: "testFunction", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(2);
        expect(boundary.start).toBeGreaterThanOrEqual(1);
        expect(boundary.end).toBeGreaterThan(boundary.start);
      });
    });

    describe("Named function edge cases", () => {
      it("should find function declaration when reported line is inside function", () => {
        const sourceCode = `function testFunction() {
  if (true) {
    return true;
  }
}`;
        const functions = [
          { line: 2, functionName: "testFunction", nodeType: "FunctionDeclaration" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(2);
        expect(boundary.start).toBe(1); // Should find declaration on line 1
        expect(boundary.end).toBeGreaterThan(1);
      });

      it("should handle exported const arrow function", () => {
        const sourceCode = `export const testFunction = () => {
  return true;
};`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "FunctionDeclaration" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.start).toBe(1);
      });

      it("should handle function with destructured parameters", () => {
        const sourceCode = `function testFunction({ prop1, prop2 }) {
  return prop1 + prop2;
}`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "FunctionDeclaration" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });

      it("should handle function with TypeScript return type", () => {
        const sourceCode = `function testFunction(): boolean {
  return true;
}`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "FunctionDeclaration" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });

      it("should handle function with TypeScript return type and type braces", () => {
        const sourceCode = `function testFunction(): { prop: string } {
  return { prop: 'value' };
}`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "FunctionDeclaration" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });

      it("should handle function with TypeScript union return type", () => {
        const sourceCode = `function testFunction(): string | number {
  return 'value';
}`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "FunctionDeclaration" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });

      it("should handle function with TypeScript generic return type", () => {
        const sourceCode = `function testFunction<T>(): T[] {
  return [];
}`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "FunctionDeclaration" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });

      it("should handle function with destructured parameters and TypeScript types", () => {
        const sourceCode = `function testFunction({ prop1, prop2 }: { prop1: string, prop2: number }): boolean {
  return true;
}`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "FunctionDeclaration" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });

      it("should handle function declaration with body brace on same line", () => {
        const sourceCode = `function testFunction() { return true; }`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "FunctionDeclaration" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThanOrEqual(1);
      });

      it("should handle React component function", () => {
        const sourceCode = `export default function Component() {
  return <div />;
}`;
        const functions = [
          { line: 1, functionName: "Component", nodeType: "FunctionDeclaration" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.start).toBe(1);
      });
    });

    describe("Function body detection edge cases", () => {
      it("should handle function with deeply nested braces", () => {
        const sourceCode = `function testFunction() {
  if (true) {
    if (true) {
      if (true) {
        return true;
      }
    }
  }
}`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "FunctionDeclaration" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });

      it("should handle function with object literals inside", () => {
        const sourceCode = `function testFunction() {
  const obj = {
    prop: {
      nested: 'value'
    }
  };
}`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "FunctionDeclaration" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });

      it("should handle function with array literals", () => {
        const sourceCode = `function testFunction() {
  const arr = [
    { id: 1 },
    { id: 2 }
  ];
}`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "FunctionDeclaration" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });

      it("should handle function with template literals containing braces", () => {
        const sourceCode = `function testFunction() {
  return \`Value: \${obj.prop}\`;
}`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "FunctionDeclaration" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });

      it("should handle arrow function callback with nested callbacks", () => {
        const sourceCode = `function parent() {
  items.map(item => {
    return item.nested.map(nested => {
      return nested.value;
    });
  });
}`;
        const functions = [
          { line: 1, functionName: "parent", nodeType: "FunctionDeclaration" },
          { line: 2, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
          { line: 3, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(3);
        const parentBoundary = result.get(1);
        const mapBoundary = result.get(2);
        const nestedBoundary = result.get(3);
        
        expect(parentBoundary.end).toBeGreaterThan(mapBoundary.end);
        expect(mapBoundary.end).toBeGreaterThan(nestedBoundary.end);
      });
    });

    describe("Fallback and edge cases", () => {
      it("should handle function when end cannot be determined", () => {
        const sourceCode = `function testFunction() {
  // Very long function
}`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "FunctionDeclaration" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThanOrEqual(boundary.start);
      });

      it("should handle function that never enters function body", () => {
        const sourceCode = `function testFunction(); // Type declaration only`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "FunctionDeclaration" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        // Should use fallback logic
        expect(boundary.end).toBeGreaterThanOrEqual(boundary.start);
      });

      it("should handle arrow function when => is not found on reported line", () => {
        const sourceCode = `const testFunction = () => true;
const otherFunction = () => false;`;
        const functions = [
          { line: 1, functionName: "otherFunction", nodeType: "ArrowFunctionExpression" }, // Wrong function name
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        // Should use fallback or find the correct function
        expect(boundary.end).toBeGreaterThanOrEqual(boundary.start);
      });

      it("should not overwrite already set boundary", () => {
        const sourceCode = `const testFunction = () => ({ prop: 'value' });`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        // Boundary should be set by object literal handling, not overwritten
        expect(boundary.end).toBe(1);
      });
    });

    describe("Complex real-world scenarios", () => {
      it("should handle React component with hooks and callbacks", () => {
        const sourceCode = `function Component() {
  useEffect(() => {
    const handler = () => {
      console.log('click');
    };
    return () => {
      cleanup();
    };
  }, []);
  
  return <div />;
}`;
        const functions = [
          { line: 1, functionName: "Component", nodeType: "FunctionDeclaration" },
          { line: 2, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
          { line: 3, functionName: "handler", nodeType: "ArrowFunctionExpression" },
          { line: 5, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(4);
        const componentBoundary = result.get(1);
        const useEffectBoundary = result.get(2);
        const handlerBoundary = result.get(3);
        const cleanupBoundary = result.get(5);
        
        expect(componentBoundary.end).toBeGreaterThan(useEffectBoundary.end);
        expect(useEffectBoundary.end).toBeGreaterThan(handlerBoundary.end);
        expect(useEffectBoundary.end).toBeGreaterThanOrEqual(cleanupBoundary.end);
      });

      it("should handle complex nested arrow functions", () => {
        const sourceCode = `function processData() {
  return data
    .filter(item => item.valid)
    .map(item => ({
      id: item.id,
      value: item.value ?? defaultValue
    }));
}`;
        const functions = [
          { line: 1, functionName: "processData", nodeType: "FunctionDeclaration" },
          { line: 3, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
          { line: 4, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(3);
        const processBoundary = result.get(1);
        const filterBoundary = result.get(3);
        const mapBoundary = result.get(4);
        
        expect(processBoundary.end).toBeGreaterThan(filterBoundary.end);
        expect(processBoundary.end).toBeGreaterThan(mapBoundary.end);
      });

      it("should handle function with JSX containing arrow functions", () => {
        const sourceCode = `function Component() {
  return (
    <div>
      {items.map(item => (
        <Item key={item.id} onClick={() => handleClick(item.id)} />
      ))}
    </div>
  );
}`;
        const functions = [
          { line: 1, functionName: "Component", nodeType: "FunctionDeclaration" },
          { line: 4, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
          { line: 4, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBeGreaterThan(0);
        const componentBoundary = result.get(1);
        expect(componentBoundary.end).toBeGreaterThan(1);
      });
    });

    describe("JSX return pattern edge cases", () => {
      it("should handle JSX return with closing parens on next line", () => {
        const sourceCode = `const Component = () => (
  <div>Hello</div>
)
);`;
        const functions = [
          { line: 1, functionName: "Component", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });

      it("should handle JSX return with closing brace and paren", () => {
        const sourceCode = `const Component = () => (
  <div>Hello</div>
}
);`;
        const functions = [
          { line: 1, functionName: "Component", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });

      it("should handle JSX return with nested parentheses", () => {
        const sourceCode = `const Component = () => (
  <div>
    {items.map(item => (
      <Item key={item.id} />
    ))}
  </div>
);`;
        const functions = [
          { line: 1, functionName: "Component", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });
    });

    describe("Object literal arrow function edge cases", () => {
      it("should handle object literal with nested objects", () => {
        const sourceCode = `const testFunction = () => ({ prop: { nested: 'value' } });`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBe(1);
      });

      it("should handle object literal with array", () => {
        const sourceCode = `const testFunction = () => ({ items: [1, 2, 3] });`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBe(1);
      });

      it("should handle object literal with whitespace before brace", () => {
        const sourceCode = `const testFunction = () => ( { prop: 'value' } );`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBe(1);
      });

      it("should handle object literal without closing paren on same line", () => {
        const sourceCode = `const testFunction = () => ({
  prop: 'value'
});`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        // Should fallback to same line or handle multi-line
        expect(boundary.end).toBeGreaterThanOrEqual(1);
      });
    });

    describe("Arrow function in JSX attribute edge cases", () => {
      it("should handle arrow function in onChange with parameters", () => {
        const sourceCode = `<input onChange={(e) => setValue(e.target.value)} />`;
        const functions = [
          { line: 1, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBe(1);
      });

      it("should handle arrow function in onClick without parameters", () => {
        const sourceCode = `<button onClick={() => handleClick()}>Click</button>`;
        const functions = [
          { line: 1, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBe(1);
      });

      it("should handle arrow function in JSX attribute with nested parentheses", () => {
        const sourceCode = `<Component prop={(item) => (item.id === targetId)} />`;
        const functions = [
          { line: 1, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBe(1);
      });
    });

    describe("Single-expression arrow function edge cases", () => {
      it("should handle arrow function ending with semicolon on same line", () => {
        const sourceCode = `const testFunction = () => someValue;`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBe(1);
      });

      it("should handle arrow function ending with comma on same line", () => {
        const sourceCode = `const items = [1, 2, 3].map(item => item * 2,);`;
        const functions = [
          { line: 1, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBe(1);
      });

      it("should handle arrow function in method call with closing paren", () => {
        const sourceCode = `const result = items.find(item => item.id === targetId);`;
        const functions = [
          { line: 1, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBe(1);
      });

      it("should handle arrow function spanning multiple lines in method call", () => {
        const sourceCode = `const result = items.find(item =>
  item.id === targetId &&
  item.valid
);`;
        const functions = [
          { line: 1, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });

      it("should handle arrow function ending with closing brace", () => {
        const sourceCode = `const obj = { fn: () => value };`;
        const functions = [
          { line: 1, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBe(1);
      });
    });

    describe("Dependency array edge cases", () => {
      it("should handle useEffect with empty dependency array", () => {
        const sourceCode = `useEffect(() => {
  console.log('mounted');
}, []);`;
        const functions = [
          { line: 1, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });

      it("should handle useEffect with multiple dependencies", () => {
        const sourceCode = `useEffect(() => {
  console.log('mounted');
}, [dep1, dep2, dep3]);`;
        const functions = [
          { line: 1, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });

      it("should handle useEffect with dependency array on multiple lines", () => {
        const sourceCode = `useEffect(() => {
  console.log('mounted');
}, [
  dep1,
  dep2
]);`;
        const functions = [
          { line: 1, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });
    });

    describe("setTimeout/setInterval edge cases", () => {
      it("should handle setTimeout with delay parameter", () => {
        const sourceCode = `setTimeout(() => {
  console.log('timeout');
}, 1000);`;
        const functions = [
          { line: 1, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });

      it("should handle setTimeout with delay on same line", () => {
        const sourceCode = `setTimeout(() => { console.log('timeout'); }, 1000);`;
        const functions = [
          { line: 1, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThanOrEqual(1);
      });

      it("should handle setInterval callback", () => {
        const sourceCode = `setInterval(() => {
  console.log('interval');
}, 1000);`;
        const functions = [
          { line: 1, functionName: "anonymous", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });
    });

    describe("Type definition brace tracking", () => {
      it("should handle function with type definition containing braces", () => {
        const sourceCode = `function testFunction(): { prop: { nested: string } } {
  return { prop: { nested: 'value' } };
}`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "FunctionDeclaration" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });

      it("should handle function with type definition before body", () => {
        const sourceCode = `function testFunction(): ReturnType {
  return value;
}`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "FunctionDeclaration" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });
    });

    describe("Function body detection edge cases", () => {
      it("should handle function with body brace on same line as declaration", () => {
        const sourceCode = `function testFunction() { return true; }`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "FunctionDeclaration" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThanOrEqual(1);
      });

      it("should handle function with destructured params and body brace", () => {
        const sourceCode = `function testFunction({ prop1, prop2 }) {
  return prop1 + prop2;
}`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "FunctionDeclaration" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });

      it("should handle arrow function without braces (single expression)", () => {
        const sourceCode = `const testFunction = () => value;`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBe(1);
      });

      it("should handle arrow function without braces spanning lines", () => {
        const sourceCode = `const testFunction = () =>
  someValue;`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        expect(boundary.end).toBeGreaterThan(1);
      });
    });

    describe("Fallback logic edge cases", () => {
      it("should use fallback when function body is never found", () => {
        const sourceCode = `function testFunction();`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "FunctionDeclaration" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        // Should use fallback
        expect(boundary.end).toBeGreaterThanOrEqual(boundary.start);
      });

      it("should handle very large function with fallback", () => {
        const sourceCode = `function testFunction() {
${Array(600).fill("  // line").join('\n')}
}`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "FunctionDeclaration" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        // Should handle large function
        expect(boundary.end).toBeGreaterThan(1);
      });

      it("should handle function when end equals start", () => {
        const sourceCode = `const testFunction = () => ({ prop: 'value' });`;
        const functions = [
          { line: 1, functionName: "testFunction", nodeType: "ArrowFunctionExpression" },
        ];
        const result = findFunctionBoundaries(sourceCode, functions);
        
        expect(result.size).toBe(1);
        const boundary = result.get(1);
        // Object literal ends on same line
        expect(boundary.end).toBe(1);
        expect(boundary.start).toBe(1);
      });
    });
  });
});
