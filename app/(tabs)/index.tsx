import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import ScreenWrapper from '../../components/ScreenWrapper';
import GlassPane from '../../components/GlassPane';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFinancialData } from '../../hooks/useFinancialData';
import { useCurrencyStore } from '../../store/currencyStore';
import SmsParserManager from '../../components/SmsParserManager';
import { Platform } from 'react-native';
import { format } from 'date-fns';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { totalBalance, income, expense, recentTransactions, budgets, loading, refetch } = useFinancialData();
  const { getCurrencySymbol } = useCurrencyStore();

  // Function to get time-appropriate greeting
  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good Afternoon';
    } else if (hour >= 17 && hour < 21) {
      return 'Good Evening';
    } else {
      return 'Good Night';
    }
  };

  // Refetch data when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <ScreenWrapper 
       scroll={true}
       contentContainerStyle={{ paddingBottom: 100 }}
       refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor="#fff" />
       }
    >
      {/* Header */}
      <View className="flex-row items-center justify-between p-6">
        <View className="flex-row items-center gap-3">
          <View className="relative">
            <View className="w-12 h-12 rounded-full border-2 border-white/10 overflow-hidden bg-gray-500">
               {/* Avatar Placeholder */}
               <Image 
                 source={{ uri: 'https://ui-avatars.com/api/?name=' + (user?.user_metadata?.name || 'User') + '&background=random' }} 
                 className="w-full h-full"
               />
            </View>
            <View className="absolute bottom-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-background-dark" />
          </View>
          <View>
            <Text className="text-white/60 text-xs font-medium font-display uppercase tracking-wider">{getGreeting()}</Text>
            <Text className="text-white text-lg font-bold font-display">{user?.user_metadata?.name || 'Alex Sterling'}</Text>
          </View>
        </View>
        <View className="w-10" />
      </View>

      {/* SMS Parser Manager - Only for Android */}
      {Platform.OS === 'android' && (
        <SmsParserManager />
      )}

      <View className="flex-1 px-4 gap-4 pb-24">
        {/* Total Balance Card */}
        <GlassPane className="p-6 rounded-3xl relative overflow-hidden">
          {/* Background Glow */}
          <View className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <View className="relative z-10 flex-col gap-2">
            <Text className="text-white/60 text-base font-medium font-body">Total Balance</Text>
            <Text className={`${totalBalance >= 1000000 ? 'text-4xl' : 'text-5xl'} font-bold tracking-tight text-white font-display`}>
              {getCurrencySymbol()}{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        </GlassPane>

        {/* Income & Expense Row */}
        <View className="flex-row gap-4">
          <GlassPane className="flex-1 p-5 rounded-2xl gap-3">
            <View className="w-10 h-10 rounded-full bg-accent/10 items-center justify-center">
              <MaterialIcons name="arrow-downward" size={20} color="#F9E7B2" />
            </View>
            <View>
              <Text className="text-white/50 text-xs font-medium mb-1">Income</Text>
              <Text className="text-accent text-xl font-bold tracking-tight">{getCurrencySymbol()}{income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
          </GlassPane>
          <GlassPane className="flex-1 p-5 rounded-2xl gap-3">
             <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
              <MaterialIcons name="arrow-upward" size={20} color="#D34E4E" />
            </View>
            <View>
              <Text className="text-white/50 text-xs font-medium mb-1">Expense</Text>
              <Text className="text-white text-xl font-bold tracking-tight">{getCurrencySymbol()}{expense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
          </GlassPane>
        </View>

        {/* Budget Progress */}
        {budgets && budgets.length > 0 ? (
          budgets.map((budget) => {
            const spent = budget.spent || 0;
            const amount = budget.amount || 0;
            const percentage = amount > 0 ? Math.min(100, Math.round((spent / amount) * 100)) : 0;

            return (
              <GlassPane key={budget.id} className="p-5 rounded-2xl gap-3">
                <View className="flex-row justify-between items-end">
                  <View>
                    <Text className="text-white text-sm font-semibold mb-1">
                      {budget.category_name ? `${budget.category_name} Budget` : 'Monthly Budget'}
                    </Text>
                    <Text className="text-white/50 text-xs">
                      {"You've spent "}<Text className="text-white font-medium">{getCurrencySymbol()}{spent.toFixed(2)}</Text> of {getCurrencySymbol()}{amount.toFixed(2)}
                    </Text>
                  </View>
                  <Text className="text-accent text-sm font-bold">{percentage}%</Text>
                </View>
                <View className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-accent rounded-full shadow-[0_0_8px_rgba(249,231,178,0.6)]"
                    style={{ width: `${percentage}%` }}
                  />
                </View>
              </GlassPane>
            );
          })
        ) : (
          <GlassPane className="p-5 rounded-2xl gap-3">
            <View className="items-center justify-center py-6">
              <Text className="text-white/50 text-center mb-2">No budget set</Text>
              <Text className="text-white/40 text-xs text-center">Set a monthly budget to track your spending</Text>
            </View>
          </GlassPane>
        )}

        {/* Recent Transactions */}
        <GlassPane className="rounded-2xl overflow-hidden mb-6">
          <View className="p-5 pb-2 flex-row justify-between items-center">
            <Text className="text-white text-sm font-semibold">Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
               <Text className="text-primary text-xs font-semibold">See all</Text>
            </TouchableOpacity>
          </View>
          <View>
            {recentTransactions.length === 0 ? (
                <View className="p-4 items-center">
                    <Text className="text-white/40 text-sm">No recent transactions</Text>
                </View>
            ) : (
                recentTransactions.map((tx, index) => (
                <TouchableOpacity key={tx.id} className={`flex-row items-center justify-between p-4 active:bg-white/5 ${index !== recentTransactions.length - 1 ? 'border-b border-white/5' : ''}`}>
                    <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
                        <MaterialIcons 
                            name={(tx.categories?.icon as any) || (tx.transaction_type === 'income' ? 'attach-money' : 'payment')} 
                            size={20} 
                            color={tx.transaction_type === 'income' ? '#F9E7B2' : 'white'} 
                        />
                    </View>
                    <View>
                        <Text className="text-white text-sm font-semibold">{tx.description || 'Untitled'}</Text>
                        <Text className="text-white/40 text-[11px]">{format(new Date(tx.date), 'MMM d, h:mm a')}</Text>
                    </View>
                    </View>
                    <Text className={`font-bold text-sm ${tx.transaction_type === 'income' ? 'text-accent' : 'text-white'}`}>
                    {tx.transaction_type === 'income' ? '+' : '-'}{getCurrencySymbol()}{Math.abs(tx.amount).toFixed(2)}
                    </Text>
                </TouchableOpacity>
                ))
            )}
          </View>
        </GlassPane>
      </View>
    </ScreenWrapper>
  );
}