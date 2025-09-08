import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CsvImportService, ParsedCsvRow, CsvImportResult } from "@/utils/csvImport";
import { formatCurrency } from "@/utils/formatters";

interface PropertyImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

export const PropertyImportDialog = ({ open, onOpenChange, onImportComplete }: PropertyImportDialogProps) => {
  const [step, setStep] = useState<'upload' | 'validate' | 'import' | 'complete'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedCsvRow[]>([]);
  const [importResult, setImportResult] = useState<CsvImportResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const parseFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const parsed = await CsvImportService.parseCsvFile(file);
      setParsedData(parsed);
      setStep('validate');
    } catch (error) {
      toast({
        title: "Parse Error",
        description: error instanceof Error ? error.message : "Failed to parse CSV file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const startImport = async () => {
    if (!user || parsedData.length === 0) return;

    setStep('import');
    setProgress(0);
    
    try {
      const result = await CsvImportService.bulkCreateProperties(
        parsedData,
        user.id,
        setProgress
      );
      
      setImportResult(result);
      setStep('complete');
      
      toast({
        title: "Import Complete",
        description: `Successfully imported ${result.successCount} of ${result.totalRows} properties.`,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import properties",
        variant: "destructive",
      });
      setStep('validate');
    }
  };

  const handleClose = () => {
    setStep('upload');
    setFile(null);
    setParsedData([]);
    setImportResult(null);
    setProgress(0);
    setIsProcessing(false);
    onOpenChange(false);
    
    if (importResult?.success) {
      onImportComplete();
    }
  };

  const downloadTemplate = () => {
    CsvImportService.downloadCsvTemplate();
  };

  const validRows = parsedData.filter(row => row.isValid);
  const invalidRows = parsedData.filter(row => !row.isValid);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Properties</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple properties at once.
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Upload CSV File</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>

            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center space-y-4 hover:border-muted-foreground/50 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mx-auto w-12 h-12 text-muted-foreground">
                <Upload className="h-12 w-12" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  {file ? file.name : "Drop your CSV file here"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {file ? "Click to select a different file" : "or click to browse"}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            {file && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <FileText className="h-4 w-4" />
                <span className="text-sm">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  className="ml-auto h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 'validate' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Validation Results</h3>
              <div className="flex gap-2">
                <Badge variant="default">{validRows.length} Valid</Badge>
                {invalidRows.length > 0 && (
                  <Badge variant="destructive">{invalidRows.length} Invalid</Badge>
                )}
              </div>
            </div>

            {invalidRows.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {invalidRows.length} rows have validation errors. Only valid rows will be imported.
                </AlertDescription>
              </Alert>
            )}

            <div className="border rounded-lg max-h-64 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 10).map((row) => (
                    <TableRow key={row.row}>
                      <TableCell>{row.row}</TableCell>
                      <TableCell>{row.data.name}</TableCell>
                      <TableCell>{formatCurrency(Number(row.data.purchase_price) || 0)}</TableCell>
                      <TableCell>{formatCurrency(Number(row.data.weekly_rent) || 0)}</TableCell>
                      <TableCell>{row.data.location}</TableCell>
                      <TableCell>
                        {row.isValid ? (
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Valid
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Invalid
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {parsedData.length > 10 && (
                <div className="p-2 text-center text-sm text-muted-foreground border-t">
                  ... and {parsedData.length - 10} more rows
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'import' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Importing Properties</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
            <p className="text-sm text-muted-foreground">
              Importing {validRows.length} valid properties...
            </p>
          </div>
        )}

        {step === 'complete' && importResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-medium">Import Complete</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-700">{importResult.successCount}</div>
                <div className="text-sm text-green-600">Properties Created</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{importResult.totalRows}</div>
                <div className="text-sm text-muted-foreground">Total Rows</div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {importResult.errors.length} errors occurred during import. Check the details below.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'upload' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={parseFile} 
                disabled={!file || isProcessing}
              >
                {isProcessing ? "Parsing..." : "Parse File"}
              </Button>
            </>
          )}

          {step === 'validate' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button 
                onClick={startImport} 
                disabled={validRows.length === 0}
              >
                Import {validRows.length} Properties
              </Button>
            </>
          )}

          {step === 'import' && (
            <Button disabled>
              Importing...
            </Button>
          )}

          {step === 'complete' && (
            <Button onClick={handleClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};