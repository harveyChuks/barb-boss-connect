
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeSettings = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-foreground text-lg">Theme Settings</CardTitle>
            <CardDescription className="text-muted-foreground">
              Choose between dark and light themes
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current theme:</span>
            <Badge variant="outline" className="border-primary text-primary">
              {theme === 'dark' ? 'Dark Theme' : 'Light Theme'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              className="flex items-center space-x-2 h-12"
            >
              <Moon className="w-4 h-4" />
              <span>Dark</span>
            </Button>
            
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              className="flex items-center space-x-2 h-12"
            >
              <Sun className="w-4 h-4" />
              <span>Light</span>
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Theme preference will be saved and applied across all pages.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeSettings;
