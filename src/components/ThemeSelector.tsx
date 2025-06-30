
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Check } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeSelector = () => {
  const { theme, setTheme, themes } = useTheme();

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-foreground text-lg">Theme Selection</CardTitle>
            <CardDescription className="text-muted-foreground">
              Choose your preferred theme
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((themeOption) => (
            <div
              key={themeOption.id}
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                theme === themeOption.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
              onClick={() => setTheme(themeOption.id)}
            >
              {theme === themeOption.id && (
                <div className="absolute top-2 right-2">
                  <Check className="w-5 h-5 text-primary" />
                </div>
              )}
              
              <div className={`w-full h-8 rounded mb-3 ${themeOption.preview}`}></div>
              
              <h3 className="font-semibold text-foreground mb-1">{themeOption.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{themeOption.description}</p>
              
              {theme === themeOption.id && (
                <Badge variant="default" className="text-xs">
                  Active
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeSelector;
