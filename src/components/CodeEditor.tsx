"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlayCircle, Terminal } from "lucide-react"

interface CodeEditorProps {
  initialCode?: string
  editorType?: "javascript" | "typescript" | "jupyter"
}

export function CodeEditor({
  initialCode = "// Write your JavaScript code here\nconsole.log('Hello World!');\n\nconst numbers = [1, 2, 3, 4, 5];\nconst sum = numbers.reduce((a, b) => a + b, 0);\nconsole.log('Sum:', sum);",
  editorType = "javascript"
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runCode = () => {
    setIsRunning(true)
    setOutput([])
    const logs: string[] = []

    // Capture console.log output
    const originalLog = console.log
    console.log = (...args: any[]) => {
      logs.push(args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '))
    }

    try {
      // Execute the code
      // eslint-disable-next-line no-eval
      eval(code)

      if (logs.length === 0) {
        logs.push('Code executed successfully (no output)')
      }
    } catch (error) {
      logs.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      // Restore original console.log
      console.log = originalLog
      setOutput(logs)
      setIsRunning(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Interactive Code Editor
            </CardTitle>
            <Button
              onClick={runCode}
              disabled={isRunning}
              size="sm"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              <PlayCircle className="w-4 h-4 mr-1" />
              Run Code
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-3 pb-4">
          {/* Code Editor */}
          <div className="flex-1 min-h-0">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
              spellCheck={false}
              placeholder="Write your code here..."
            />
          </div>

          {/* Output Panel */}
          {output.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                Output:
              </h4>
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-48 overflow-y-auto">
                {output.map((line, idx) => (
                  <div key={idx} className="mb-1">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
