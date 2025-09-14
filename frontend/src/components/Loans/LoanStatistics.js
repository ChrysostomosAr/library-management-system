import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Clock,
  Book
} from 'lucide-react';
import loanService from '../../services/loanService';

const LoanStatistics = ({ compact = false, refreshTrigger = 0, onError }) => {
  const [stats, setStats] = useState({
    totalLoans: 0,
    activeLoans: 0,
    overdueLoans: 0,
    returnedLoans: 0,
    availableBooks: 0,
    totalBooks: 0,
    totalMembers: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadStatistics();
  }, [refreshTrigger]);

  const loadStatistics = async () => {
    setLoading(true);
    
    try {
      const statisticsData = await loanService.calculateStatistics();
      setStats(statisticsData);
      setLastUpdated(new Date());

      if (onError) {
        onError('');
      }

    } catch (error) {
      console.error('Error loading statistics:', error);
      if (onError) {
        onError('Σφάλμα κατά τη φόρτωση στατιστικών: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => {
    const colorClasses = {
      blue: 'bg-blue-50 border-blue-200 text-blue-600',
      red: 'bg-red-50 border-red-200 text-red-600',
      green: 'bg-green-50 border-green-200 text-green-600',
      purple: 'bg-purple-50 border-purple-200 text-purple-600',
      orange: 'bg-orange-50 border-orange-200 text-orange-600',
      gray: 'bg-gray-50 border-gray-200 text-gray-600'
    };

    const textColorClasses = {
      blue: 'text-blue-900',
      red: 'text-red-900',
      green: 'text-green-900',
      purple: 'text-purple-900',
      orange: 'text-orange-900',
      gray: 'text-gray-900'
    };

    const iconColorClasses = {
      blue: 'text-blue-500',
      red: 'text-red-500',
      green: 'text-green-500',
      purple: 'text-purple-500',
      orange: 'text-orange-500',
      gray: 'text-gray-500'
    };

    return (
      <div className={`p-${compact ? '4' : '6'} rounded-lg border ${colorClasses[color]}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className={`text-sm font-medium ${color === 'blue' ? 'text-blue-600' : color === 'red' ? 'text-red-600' : color === 'green' ? 'text-green-600' : color === 'purple' ? 'text-purple-600' : color === 'orange' ? 'text-orange-600' : 'text-gray-600'}`}>
              {title}
            </p>
            <p className={`${compact ? 'text-xl' : 'text-2xl'} font-bold ${textColorClasses[color]} mt-1`}>
              {loading ? '...' : value.toLocaleString()}
            </p>
            {subtitle && (
              <p className={`text-xs mt-1 ${color === 'blue' ? 'text-blue-500' : color === 'red' ? 'text-red-500' : color === 'green' ? 'text-green-500' : color === 'purple' ? 'text-purple-500' : color === 'orange' ? 'text-orange-500' : 'text-gray-500'}`}>
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end">
            <Icon className={`h-${compact ? '6' : '8'} w-${compact ? '6' : '8'} ${iconColorClasses[color]}`} />
            {trend && (
              <div className="flex items-center mt-1">
                {trend > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={`text-xs ml-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(trend)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">Στατιστικά</h3>
          <button
            onClick={loadStatistics}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:animate-spin"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          <StatCard
            title="Ενεργοί"
            value={stats.activeLoans}
            icon={Calendar}
            color="blue"
          />
          <StatCard
            title="Καθυστερημένοι"
            value={stats.overdueLoans}
            icon={AlertCircle}
            color="red"
          />
          <StatCard
            title="Διαθέσιμα Βιβλία"
            value={stats.availableBooks}
            icon={Book}
            color="green"
          />
        </div>

        {lastUpdated && (
          <p className="text-xs text-gray-500 text-center mt-3">
            Τελευταία ενημέρωση: {lastUpdated.toLocaleTimeString('el-GR')}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Στατιστικά Δανεισμών</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={loadStatistics}
            disabled={loading}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Ανανέωση
          </button>
          {lastUpdated && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {lastUpdated.toLocaleString('el-GR')}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ενεργοί Δανεισμοί"
          value={stats.activeLoans}
          icon={BookOpen}
          color="blue"
          subtitle="Τρέχοντες δανεισμοί"
        />

        <StatCard
          title="Καθυστερημένα"
          value={stats.overdueLoans}
          icon={AlertCircle}
          color="red"
          subtitle="Πέραν της προθεσμίας"
        />

        <StatCard
          title="Επιστροφές"
          value={stats.returnedLoans}
          icon={CheckCircle}
          color="green"
          subtitle="Ολοκληρωμένοι δανεισμοί"
        />

        <StatCard
          title="Διαθέσιμα Βιβλία"
          value={stats.availableBooks}
          icon={Book}
          color="purple"
          subtitle="Προς δανεισμό"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Σύνολο Δανεισμών"
          value={stats.totalLoans}
          icon={Calendar}
          color="gray"
          subtitle="Όλοι οι δανεισμοί"
        />

        <StatCard
          title="Συνολικά Μέλη"
          value={stats.totalUsers}
          icon={Users}
          color="orange"
          subtitle="Εγγεγραμμένοι χρήστες"
        />
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Γρήγορες Πληροφορίες</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalLoans > 0 ? Math.round((stats.activeLoans / stats.totalLoans) * 100) : 0}%
            </div>
            <div className="text-sm text-blue-800 mt-1">Ποσοστό Ενεργών</div>
          </div>

          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {stats.activeLoans > 0 ? Math.round((stats.overdueLoans / stats.activeLoans) * 100) : 0}%
            </div>
            <div className="text-sm text-red-800 mt-1">Ποσοστό Καθυστερήσεων</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.totalLoans > 0 ? Math.round((stats.returnedLoans / stats.totalLoans) * 100) : 0}%
            </div>
            <div className="text-sm text-green-800 mt-1">Ποσοστό Επιστροφών</div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="text-gray-600">Ενημέρωση στατιστικών...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanStatistics;