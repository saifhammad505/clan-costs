import { useState } from "react";
import { Wallet, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { addBankTransaction } from "@/lib/bank-api";
import { formatCurrency, FAMILY_MEMBERS, BankTransaction } from "@/types/expense";
import { useAuth } from "@/hooks/useAuth";

interface BankBalanceCardProps {
  balance: number;
  transactions: BankTransaction[];
}

export function BankBalanceCard({ balance, transactions }: BankBalanceCardProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"deposit" | "withdrawal">("deposit");
  const [fromMember, setFromMember] = useState("");
  const [description, setDescription] = useState("");
  
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be logged in");
      return addBankTransaction({
        userId: user.id,
        amount: parseFloat(amount),
        type,
        fromMember: fromMember || undefined,
        description: description || undefined,
        date: format(new Date(), "yyyy-MM-dd"),
      }, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-transactions'] });
      toast({
        title: "Transaction added",
        description: `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} recorded successfully.`,
      });
      setOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add transaction.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setAmount("");
    setType("deposit");
    setFromMember("");
    setDescription("");
  };

  const recentDeposits = transactions
    .filter(t => t.type === 'deposit')
    .slice(0, 3);

  return (
    <Card className="glass-card premium-shadow animate-slide-up">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Available Balance
        </CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {balance >= 0 ? 'In account' : 'Deficit'}
            </p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Add Funds
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Bank Transaction</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Transaction Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as "deposit" | "withdrawal")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-success" />
                          Deposit (Add Money)
                        </div>
                      </SelectItem>
                      <SelectItem value="withdrawal">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-destructive" />
                          Withdrawal
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Amount (PKR)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                {type === "deposit" && (
                  <div className="space-y-2">
                    <Label>Received From</Label>
                    <Select value={fromMember} onValueChange={setFromMember}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select family member" />
                      </SelectTrigger>
                      <SelectContent>
                        {FAMILY_MEMBERS.map((member) => (
                          <SelectItem key={member} value={member}>
                            {member}
                          </SelectItem>
                        ))}
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea
                    placeholder="Add a note..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => mutation.mutate()}
                  disabled={!amount || parseFloat(amount) <= 0 || mutation.isPending}
                >
                  {mutation.isPending ? "Adding..." : "Add Transaction"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {recentDeposits.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs font-medium text-muted-foreground mb-2">Recent Deposits</p>
            <div className="space-y-1">
              {recentDeposits.map((t) => (
                <div key={t.id} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {t.fromMember || 'Unknown'} - {format(new Date(t.date), 'MMM d')}
                  </span>
                  <span className="text-success font-medium">+{formatCurrency(t.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
