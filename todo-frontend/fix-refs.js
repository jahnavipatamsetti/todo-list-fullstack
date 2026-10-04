const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Regex to match Shadcn v4 functional components that wrap Radix primitives
  // e.g. function DialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) { return <DialogPrimitive.Content ... /> }
  const regex = /function\s+([A-Z][a-zA-Z0-9]+)\s*\(\s*\{\s*([^}]*)\s*\}\s*:\s*React\.ComponentProps\s*<\s*typeof\s+([A-Za-z0-9_.]+)\s*>\s*(?:&\s*\{[^}]+\})?\s*\)\s*\{\s*return\s*\(?\s*<([^>\s]+)([\s\S]*?)>\s*(?:\{children\}\s*<\/[^>]+>)?\s*\)?\s*;/g;

  // Let's use a simpler approach. Just look for `function Name({ ...props }: React.ComponentProps<typeof Primitive.Name>) { return <Primitive.Name {...props} /> }`
  // Actually, let's just manually `forwardRef` the key components in these files by doing a string replacement script.
}

// Just a quick script to fix specific components that are likely causing issues.
const files = [
  'src/app/components/ui/dialog.tsx',
  'src/app/components/ui/alert-dialog.tsx',
  'src/app/components/ui/select.tsx',
  'src/app/components/ui/dropdown-menu.tsx',
  'src/app/components/ui/command.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');
  
  // Transform function components to forwardRef
  // Match: function ComponentName({ args }: Type) { return ... }
  // We'll replace it with standard forwardRef.
  
  // We can just use an AST transform or regex, but regex is tricky.
}
