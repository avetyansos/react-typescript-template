"use client"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
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
  ListChecks,
  CalendarDays,
  Plus,
  PieChart as PieChartIcon,
  Clock,
  ClipboardList,
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

const RADIAN = Math.PI / 180
const renderCustomizedLabel = ({
                                 cx,
                                 cy,
                                 midAngle,
                                 innerRadius,
                                 outerRadius,
                                 percent,
                                 name,
                               }: {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
  index: number
  name: string
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
      <text
          x={x}
          y={y}
          fill="#fff"
          textAnchor={x > cx ? "start" : "end"}
          dominantBaseline="central"
          style={{ fontSize: "0.75rem" }}
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
  )
}

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

  const [errors, setErrors] = useState<{
    description?: string
    amount?: string
    category?: string
    date?: string
  }>({})

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("expenseTrackerExpenses", JSON.stringify(expenses))
    }
  }, [expenses])

  const addExpense = useCallback(() => {
    const newErrors: typeof errors = {}

    if (!description) {
      newErrors.description = "Description is required."
    }
    if (amount === undefined || isNaN(amount)) {
      newErrors.amount = "A valid amount is required."
    }
    if (!category) {
      newErrors.category = "Please select a category."
    }
    if (!date) {
      newErrors.date = "Date is required."
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    } else {
      setErrors({})
    }

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      description,
      amount: Number(amount),
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

  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0)
  const expenseCount = expenses.length
  const latestExpenseDate = expenseCount > 0 ? expenses[expenseCount - 1].date : null

  const categoryData = expenses.reduce((acc, exp) => {
    const found = acc.find((item) => item.name === exp.category)
    if (found) {
      found.value += exp.amount
    } else {
      acc.push({ name: exp.category, value: exp.amount })
    }
    return acc
  }, [] as { name: string; value: number }[])

  const dailyData = expenses.reduce((acc, exp) => {
    const dateStr = exp.date.toISOString().split("T")[0]
    const found = acc.find((item) => item.date === dateStr)
    if (found) {
      found.dailySpent += exp.amount
    } else {
      acc.push({ date: dateStr, dailySpent: exp.amount })
    }
    return acc
  }, [] as { date: string; dailySpent: number }[])

  return (
      <div className="min-h-screen p-4 sm:p-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          {/* Title & subtitle */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              Expense Tracker
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Manage your personal finances with ease
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Expenses */}
            <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-none">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                  <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Total Expenses
                  </p>
                  <h3 className="text-2xl font-bold">
                    ${totalExpenses.toFixed(2)}
                  </h3>
                </div>
              </CardContent>
            </Card>

            {/* Filtered Total (placeholder) */}
            <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-none">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                  <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Filtered Total
                  </p>
                  <h3 className="text-2xl font-bold">
                    ${totalExpenses.toFixed(2)}
                  </h3>
                </div>
              </CardContent>
            </Card>

            {/* Expense Count */}
            <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-none">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                  <ListChecks className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Expense Count
                  </p>
                  <h3 className="text-2xl font-bold">{expenseCount}</h3>
                </div>
              </CardContent>
            </Card>

            {/* Latest Expense */}
            <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-none">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full">
                  <CalendarDays className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Latest Expense
                  </p>
                  <h3 className="text-2xl font-bold">
                    {latestExpenseDate
                        ? latestExpenseDate.toLocaleDateString()
                        : "No expenses yet"}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="addExpense">
            <TabsList className="grid grid-cols-2 w-full mb-4 bg-slate-50 dark:bg-slate-800 p-1 rounded-md">
              <TabsTrigger
                  value="addExpense"
                  className="px-4 py-2 text-sm border border-transparent rounded-md bg-transparent text-slate-900 dark:text-slate-300
                data-[state=active]:bg-[#2463eb] dark:data-[state=active]:bg-[#0b172a]
                data-[state=active]:border data-[state=active]:border-slate-200
                data-[state=active]:shadow-sm data-[state=active]:text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </TabsTrigger>
              <TabsTrigger
                  value="analytics"
                  className="px-4 py-2 text-sm border border-transparent rounded-md bg-transparent text-slate-900 dark:text-slate-300
                data-[state=active]:bg-[#2463eb] dark:data-[state=active]:bg-[#0b172a]
                data-[state=active]:border data-[state=active]:border-slate-200
                data-[state=active]:shadow-sm data-[state=active]:text-white"
              >
                <PieChartIcon className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* ADD EXPENSE TAB */}
            <TabsContent value="addExpense" className="space-y-4">
              {/* Add New Expense Section */}
              <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-none p-6">
                <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Add New Expense
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {/* Form fields */}
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Description */}
                      <div>
                        <Label htmlFor="description" className="text-sm font-medium">
                          Description
                        </Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="E.g. Groceries"
                            className={`mt-1 bg-transparent shadow-none ${
                                errors.description
                                    ? "border-red-500"
                                    : "border border-slate-300 dark:border-slate-600"
                            }`}
                        />
                        {errors.description && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.description}
                            </p>
                        )}
                      </div>

                      {/* Amount */}
                      <div>
                        <Label htmlFor="amount" className="text-sm font-medium">
                          Amount
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            value={amount === undefined ? "" : amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className={`mt-1 bg-transparent shadow-none ${
                                errors.amount
                                    ? "border-red-500"
                                    : "border border-slate-300 dark:border-slate-600"
                            }`}
                        />
                        {errors.amount && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.amount}
                            </p>
                        )}
                      </div>

                      {/* Category */}
                      <div>
                        <Label htmlFor="category" className="text-sm font-medium">
                          Category
                        </Label>
                        <Select onValueChange={setCategory} value={category}>
                          <SelectTrigger
                              className={`mt-1 bg-transparent shadow-none ${
                                  errors.category
                                      ? "border-red-500"
                                      : "border border-slate-300 dark:border-slate-600"
                              }`}
                          >
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            {categories.map((cat) => (
                                <SelectItem
                                    key={cat}
                                    value={cat}
                                    className="hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-white"
                                >
                                  {cat}
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.category && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.category}
                            </p>
                        )}
                      </div>

                      {/* Date */}
                      <div>
                        <Label htmlFor="date" className="text-sm font-medium">
                          Date
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            value={date.toISOString().split("T")[0]}
                            onChange={(e) => setDate(new Date(e.target.value))}
                            className={`w-full bg-transparent shadow-none ${
                                errors.date
                                    ? "border-red-500"
                                    : "border border-slate-300 dark:border-slate-600"
                            }`}
                        />
                        {errors.date && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.date}
                            </p>
                        )}
                      </div>
                    </div>

                    <Button
                        onClick={addExpense}
                        className="bg-[#2463eb] text-white hover:bg-[#2157c4] mt-2"
                    >
                      Add Expense
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Expense History Table */}
              <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-none">
                <CardHeader className="border-b border-slate-200 dark:border-slate-700 p-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <ClipboardList className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    Expense History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="overflow-x-auto px-2">
                    <Table className="min-w-full border-collapse">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="p-2 text-sm text-slate-700 dark:text-slate-300 border-b border-[#E2E8F0]">
                            Date
                          </TableHead>
                          <TableHead className="p-2 text-sm text-slate-700 dark:text-slate-300 border-b border-[#E2E8F0]">
                            Description
                          </TableHead>
                          <TableHead className="p-2 text-sm text-slate-700 dark:text-slate-300 border-b border-[#E2E8F0]">
                            Amount
                          </TableHead>
                          <TableHead className="p-2 text-sm text-slate-700 dark:text-slate-300 border-b border-[#E2E8F0]">
                            Category
                          </TableHead>
                          <TableHead className="p-2 text-right text-sm text-slate-700 dark:text-slate-300 border-b border-[#E2E8F0]">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expenses.length === 0 ? (
                            <TableRow>
                              <TableCell
                                  colSpan={5}
                                  className="text-center p-4 text-slate-500 dark:text-slate-400"
                              >
                                No expenses added yet.
                              </TableCell>
                            </TableRow>
                        ) : (
                            expenses.map((expense) => (
                                <TableRow
                                    key={expense.id}
                                    className="hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  <TableCell className="p-2 border-b border-[#E2E8F0]">
                                    {expense.date.toLocaleDateString()}
                                  </TableCell>
                                  <TableCell className="p-2 border-b border-[#E2E8F0]">
                                    {expense.description}
                                  </TableCell>
                                  <TableCell className="p-2 border-b border-[#E2E8F0]">
                                    ${expense.amount.toFixed(2)}
                                  </TableCell>
                                  <TableCell className="p-2 border-b border-[#E2E8F0]">
                                    {expense.category}
                                  </TableCell>
                                  <TableCell className="p-2 text-right border-b border-[#E2E8F0]">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-800/30"
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
              </Card>
            </TabsContent>

            {/* ANALYTICS TAB */}
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pie Chart */}
                <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-none">
                  <CardHeader className="border-b border-slate-200 dark:border-slate-700 p-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                      <PieChartIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
                                label={renderCustomizedLabel}
                            >
                              {categoryData.map((_, index) => (
                                  <Cell
                                      key={`pie-cell-${index}`}
                                      fill={[
                                        "#FF6384",
                                        "#36A2EB",
                                        "#FFCE56",
                                        "#4BC0C0",
                                        "#9966FF",
                                      ][index % 5]}
                                  />
                              ))}
                            </Pie>
                            <ReTooltip
                                formatter={(value: number) => `$${value.toFixed(2)}`}
                                contentStyle={{
                                  backgroundColor: "#1e293b",
                                  borderColor: "#475569",
                                  color: "#f8fafc",
                                  borderRadius: "0.5rem",
                                  padding: "0.5rem",
                                }}
                            />
                            <Legend />
                          </RePieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                          No data available
                        </div>
                    )}
                  </CardContent>
                </Card>

                {/* Area Chart for Daily Expenses */}
                <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-none">
                  <CardHeader className="border-b border-slate-200 dark:border-slate-700 p-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                      <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                      Daily Expenses
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 h-[300px]">
                    {dailyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                              data={dailyData}
                              margin={{ top: 20, right: 30, left: 0, bottom: 8 }}
                          >
                            <defs>
                              <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#36A2EB" stopOpacity={0.7} />
                                <stop offset="95%" stopColor="#36A2EB" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                            <XAxis dataKey="date" stroke="#475569" />
                            <YAxis stroke="#475569" />
                            <ReTooltip
                                formatter={(value: number) => `$${value.toFixed(2)}`}
                                contentStyle={{
                                  backgroundColor: "#1e293b",
                                  borderColor: "#475569",
                                  color: "#f8fafc",
                                  borderRadius: "0.5rem",
                                  padding: "0.5rem",
                                }}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="dailySpent"
                                stroke="#36A2EB"
                                fillOpacity={1}
                                fill="url(#colorSpent)"
                                name="Daily Spent"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                          No data available
                        </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
  )
}

export default ExpenseTrackerApp