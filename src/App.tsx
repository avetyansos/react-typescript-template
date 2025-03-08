"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DollarSign,
  Filter,
  List,
  CalendarDays,
  Plus,
  BarChart,
  PieChart as PieChartIcon,
} from "lucide-react"
import {
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Legend,
} from "recharts"

// Define an Expense type
interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: Date
}

interface RawExpense {
  id: string
  description: string
  amount: number
  category: string
  date: string
}

const categories = [
  "Food",
  "Housing",
  "Transportation",
  "Entertainment",
  "Utilities",
  "Other",
]

const ExpenseTrackerApp = () => {
  // 1. State Management

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("expenseTrackerExpenses")
      if (saved) {
        try {
          // Use RawExpense for stored data, then convert date from string -> Date
          const parsed: RawExpense[] = JSON.parse(saved)
          return parsed.map((exp) => ({
            ...exp,
            date: new Date(exp.date),
          }))
        } catch (err) {
          console.error("Error parsing expenses from localStorage:", err)
        }
      }
    }
    return []
  })

  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState<number | undefined>(undefined)
  const [category, setCategory] = useState("")
  const [date, setDate] = useState<Date>(new Date())

  // 2. Side Effects
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("expenseTrackerExpenses", JSON.stringify(expenses))
    }
  }, [expenses])

  // 3. Functions
  const addExpense = useCallback(() => {
    if (!description || amount === undefined || !category) {
      alert("Please fill in all fields.")
      return
    }
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      description,
      amount,
      category,
      date,
    }
    setExpenses((prev) => [...prev, newExpense])
    setDescription("")
    setAmount(undefined)
    setCategory("")
    setDate(new Date())
  }, [description, amount, category, date])

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id))
  }, [])

  // 4. Derived Data
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0)
  const expenseCount = expenses.length
  const latestExpenseDate =
      expenseCount > 0 ? expenses[expenseCount - 1].date : null

  // Prepare data for the pie chart (category breakdown)
  const categoryData = expenses.reduce((acc, exp) => {
    const found = acc.find((item) => item.name === exp.category)
    if (found) {
      found.value += exp.amount
    } else {
      acc.push({ name: exp.category, value: exp.amount })
    }
    return acc
  }, [] as { name: string; value: number }[])

  // Prepare data for the area chart (daily expenses)
  const dailyData = expenses.reduce((acc, exp) => {
    const dateStr = exp.date.toISOString().split("T")[0]
    const found = acc.find((item) => item.date === dateStr)
    if (found) {
      found.total += exp.amount
    } else {
      acc.push({ date: dateStr, total: exp.amount })
    }
    return acc
  }, [] as { date: string; total: number }[])


  return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          {/* Title & Subtitle */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-primary" />
              Expense Tracker
            </h1>
            <p className="text-muted-foreground">
              Manage your personal finances with ease
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Expenses */}
            <div className="bg-card text-card-foreground rounded-xl shadow-md border border-primary/10 p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Expenses
                  </p>
                  <h3 className="text-2xl font-bold">
                    ${totalExpenses.toFixed(2)}
                  </h3>
                </div>
              </div>
            </div>

            {/* Card 2: Filtered Total (same as total, just a placeholder) */}
            <div className="bg-card text-card-foreground rounded-xl shadow-md border border-primary/10 p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-950/30 p-2 rounded-full">
                  <Filter className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Filtered Total
                  </p>
                  <h3 className="text-2xl font-bold">
                    ${totalExpenses.toFixed(2)}
                  </h3>
                </div>
              </div>
            </div>

            {/* Card 3: Expense Count */}
            <div className="bg-card text-card-foreground rounded-xl shadow-md border border-primary/10 p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-950/30 p-2 rounded-full">
                  <List className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Expense Count
                  </p>
                  <h3 className="text-2xl font-bold">{expenseCount}</h3>
                </div>
              </div>
            </div>

            {/* Card 4: Latest Expense */}
            <div className="bg-card text-card-foreground rounded-xl shadow-md border border-primary/10 p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-950/30 p-2 rounded-full">
                  <CalendarDays className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Latest Expense
                  </p>
                  <h3 className="text-lg font-bold">
                    {latestExpenseDate
                        ? latestExpenseDate.toLocaleDateString()
                        : "No expenses yet"}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs for Add Expense & Analytics */}
          <Tabs defaultValue="addExpense" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger
                  value="addExpense"
                  className="data-[state=active]:bg-primary/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </TabsTrigger>
              <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:bg-primary/10"
              >
                <BarChart className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* ADD EXPENSE TAB */}
            <TabsContent value="addExpense">
              <div className="bg-card text-card-foreground shadow-lg border border-primary/20 w-full rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10 p-4">
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    Add New Expense
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Enter the details of your expense
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Description */}
                    <div>
                      <Label
                          htmlFor="description"
                          className="text-sm text-foreground/80"
                      >
                        Description
                      </Label>
                      <Input
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Ex: Groceries"
                          className="mt-1"
                      />
                    </div>

                    {/* Amount */}
                    <div>
                      <Label
                          htmlFor="amount"
                          className="text-sm text-foreground/80"
                      >
                        Amount
                      </Label>
                      <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={amount === undefined ? "" : amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          className="mt-1"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <Label
                          htmlFor="category"
                          className="text-sm text-foreground/80"
                      >
                        Category
                      </Label>
                      <Select onValueChange={setCategory} value={category}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date */}
                    <div>
                      <Label htmlFor="date" className="text-sm text-foreground/80">
                        Date
                      </Label>
                      <Input
                          id="date"
                          type="date"
                          value={date.toISOString().split("T")[0]}
                          onChange={(e) => setDate(new Date(e.target.value))}
                          className="mt-1"
                      />
                    </div>
                  </div>
                  <Button
                      variant="default"
                      className="bg-primary hover:bg-primary/90 text-white w-full sm:w-48 rounded-full mt-4"
                      onClick={addExpense}
                  >
                    Add Expense
                  </Button>
                </CardContent>
              </div>
            </TabsContent>

            {/* ANALYTICS TAB */}
            <TabsContent value="analytics" className="space-y-6">
              {/* Expense History Table */}
              <div className="bg-card text-card-foreground shadow-lg border border-primary/20 rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30 border-b border-purple-200 dark:border-purple-800 p-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                    <List className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                    Expense History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="overflow-x-auto w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-sm text-muted-foreground">
                            Date
                          </TableHead>
                          <TableHead className="text-sm text-muted-foreground">
                            Description
                          </TableHead>
                          <TableHead className="text-sm text-muted-foreground">
                            Amount
                          </TableHead>
                          <TableHead className="text-sm text-muted-foreground">
                            Category
                          </TableHead>
                          <TableHead className="text-right text-sm text-muted-foreground">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expenses.length === 0 ? (
                            <TableRow>
                              <TableCell
                                  colSpan={5}
                                  className="text-center text-muted-foreground/70"
                              >
                                No expenses added yet.
                              </TableCell>
                            </TableRow>
                        ) : (
                            expenses.map((expense) => (
                                <TableRow
                                    key={expense.id}
                                    className="hover:bg-muted/50"
                                >
                                  <TableCell className="text-foreground">
                                    {expense.date.toLocaleDateString()}
                                  </TableCell>
                                  <TableCell className="text-foreground">
                                    {expense.description}
                                  </TableCell>
                                  <TableCell className="text-foreground">
                                    ${expense.amount.toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-foreground">
                                    {expense.category}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-600"
                                        onClick={() => deleteExpense(expense.id)}
                                    >
                                      Delete
                                    </Button>
                                  </TableCell>
                                </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pie Chart: Expense Breakdown */}
                <div className="bg-card text-card-foreground shadow-lg border border-primary/20 rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 border-b border-blue-200 dark:border-blue-800 p-4">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                      <PieChartIcon className="w-5 h-5 text-blue-500" />
                      Expenses Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 h-[300px]">
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                            <Pie
                                data={categoryData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ name, percent }) =>
                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                            >
                              {categoryData.map((_, index) => (
                                  <Cell
                                      key={`cell-${index}`}
                                      fill={
                                        [
                                          "#FF6384",
                                          "#36A2EB",
                                          "#FFCE56",
                                          "#4BC0C0",
                                          "#9966FF",
                                        ][index % 5]
                                      }
                                  />
                              ))}
                            </Pie>
                            <ReTooltip
                                formatter={(value: number) => `$${value.toFixed(2)}`}
                                contentStyle={{
                                  backgroundColor: "var(--card)",
                                  borderColor: "var(--border)",
                                  color: "var(--foreground)",
                                  borderRadius: "0.5rem",
                                  padding: "0.5rem",
                                }}
                            />
                            <Legend />
                          </RePieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground/70">
                          No data available
                        </div>
                    )}
                  </CardContent>
                </div>

                {/* Area Chart: Daily Expenses */}
                <div className="bg-card text-card-foreground shadow-lg border border-primary/20 rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/30 border-b border-green-200 dark:border-green-800 p-4">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                      <BarChart className="w-5 h-5 text-green-500" />
                      Daily Expenses
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 h-[300px]">
                    {dailyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                              data={dailyData}
                              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient
                                  id="colorUv"
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                              >
                                <stop offset="5%" stopColor="#36A2EB" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#36A2EB" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                            <YAxis stroke="var(--muted-foreground)" />
                            <ReTooltip
                                formatter={(value: number) => `$${value.toFixed(2)}`}
                                contentStyle={{
                                  backgroundColor: "var(--card)",
                                  borderColor: "var(--border)",
                                  color: "var(--foreground)",
                                  borderRadius: "0.5rem",
                                  padding: "0.5rem",
                                }}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#36A2EB"
                                fillOpacity={1}
                                fill="url(#colorUv)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground/70">
                          No data available
                        </div>
                    )}
                  </CardContent>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
  )
}

export default ExpenseTrackerApp