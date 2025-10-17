import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, BarChart3, Loader2 } from "lucide-react";
import { toast } from "sonner";

const GraphGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        const rows = text.split('\n').map(row => row.split(','));
        setCsvData(rows);
        
        // Generate basic analysis
        const analysis = `
Dataset loaded successfully!
- Total rows: ${rows.length - 1}
- Columns: ${rows[0]?.length || 0}
- Headers: ${rows[0]?.join(', ')}

This dataset appears to contain structured data ready for analysis.
Advanced chart generation coming soon!
        `;
        setAnalysis(analysis);
        toast.success('CSV loaded successfully!');
        setLoading(false);
      };
      reader.readAsText(file);
    } catch (error) {
      toast.error('Failed to read file');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="text-primary" size={32} />
          <div>
            <h3 className="text-2xl font-bold">Graph Generator</h3>
            <p className="text-muted-foreground">Upload CSV to generate charts and analysis</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById('csv-upload')?.click()}
              disabled={loading}
            >
              <Upload size={18} className="mr-2" />
              Upload CSV File
            </Button>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          )}
        </div>
      </Card>

      {analysis && (
        <Card className="glass-card p-6 animate-fade-in">
          <h3 className="text-xl font-bold mb-4">Dataset Analysis</h3>
          <pre className="text-foreground whitespace-pre-wrap font-mono text-sm bg-background/50 p-4 rounded-lg">
            {analysis}
          </pre>
          
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="glass-card p-4 rounded-xl">
              <h4 className="font-semibold mb-2">Clustering Analysis</h4>
              <p className="text-sm text-muted-foreground">
                Scatter plots and cluster identification coming soon
              </p>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <h4 className="font-semibold mb-2">Regression Analysis</h4>
              <p className="text-sm text-muted-foreground">
                Linear and logistic regression charts coming soon
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default GraphGenerator;
