
import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { iconOptions } from './icon-options';
import { colorOptions } from './color-options';

interface IconColorSelectorProps {
  selectedIcon: string;
  selectedColor: string;
  onIconChange: (icon: string) => void;
  onColorChange: (color: string) => void;
}

export function IconColorSelector({
  selectedIcon,
  selectedColor,
  onIconChange,
  onColorChange
}: IconColorSelectorProps) {
  const [open, setOpen] = useState(false);
  const IconComponent = iconOptions.find(option => option.name === selectedIcon)?.component || iconOptions[0].component;

  const handleIconChange = (iconName: string) => {
    onIconChange(iconName);
  };

  const handleColorChange = (colorValue: string) => {
    onColorChange(colorValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-10 w-10 p-0"
          style={{ backgroundColor: selectedColor }}
          type="button"
        >
          <IconComponent className="h-5 w-5 text-white" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div>
            <Label>Icon</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {iconOptions.map((icon) => {
                const Icon = icon.component;
                return (
                  <Button
                    key={icon.name}
                    variant="outline"
                    className={`h-10 w-10 p-0 ${selectedIcon === icon.name ? 'border-2 border-primary' : ''}`}
                    onClick={() => handleIconChange(icon.name)}
                    type="button"
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                );
              })}
            </div>
          </div>
          
          <div>
            <Label>Color</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {colorOptions.map((color) => (
                <Button
                  key={color.name}
                  variant="outline"
                  className={`h-10 w-10 p-0 ${selectedColor === color.value ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => handleColorChange(color.value)}
                  type="button"
                >
                  {selectedColor === color.value && (
                    <Check className="h-4 w-4 text-white" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
