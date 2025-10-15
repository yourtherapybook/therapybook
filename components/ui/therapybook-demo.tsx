import React from 'react';
import { Button } from './button';
import { Input } from './input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Label } from './label';

/**
 * Demo component showcasing TherapyBook-styled Shadcn/ui components
 * This demonstrates the integration of Shadcn/ui with existing TherapyBook design system
 */
export const TherapyBookDemo: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-neutral-800">
            TherapyBook Shadcn/ui Integration
          </CardTitle>
          <CardDescription>
            Demonstrating the customized Shadcn/ui components with TherapyBook design system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Button Variants */}
          <div className="space-y-2">
            <Label>Button Variants</Label>
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Default Button</Button>
              <Button variant="therapybook">TherapyBook Style</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>

          {/* Input Example */}
          <div className="space-y-2">
            <Label htmlFor="demo-input">Input Field</Label>
            <Input 
              id="demo-input"
              placeholder="Enter your email address"
              type="email"
            />
          </div>

          {/* Badge Examples */}
          <div className="space-y-2">
            <Label>Badge Variants</Label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </div>

          {/* Size Variants */}
          <div className="space-y-2">
            <Label>Button Sizes</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="therapybook">Small</Button>
              <Button size="default" variant="therapybook">Default</Button>
              <Button size="lg" variant="therapybook">Large</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TherapyBookDemo;