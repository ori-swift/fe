import React, { useState, useEffect, useContext } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell, ResponsiveContainer, LabelList
} from 'recharts'
import "./Home.css"
import { companyStatistics } from '../../api/general_be_api'
import { AppContext } from '../../App'

const Home = () => {
    const { selectedCompany } = useContext(AppContext)
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [includeVAT, setIncludeVAT] = useState(true)
    const [includeClientVAT, setIncludeClientVAT] = useState(true)
    const [includeForecastVAT, setIncludeForecastVAT] = useState(true)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    const {userData} = useContext(AppContext)
    const calculateDomain = (data, dataKey) => {
        if (!data || data.length === 0) return [0, 100];
        const values = data.map(item => item[dataKey]).filter(val => typeof val === 'number');
        if (values.length === 0) return [0, 100];
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min;
        if (range === 0) {
            return [Math.max(0, min - Math.abs(min) * 0.1), max + Math.abs(max) * 0.1 + 10];
        }
        return [Math.max(0, min - range * 0.1), max + range * 0.1];
    }

    useEffect(() => {
        const fetchStats = async () => {
            if (selectedCompany?.id) {
                try {
                    setLoading(true)
                    const response = await companyStatistics(selectedCompany.id)
                    setStats({ ...response })
                } catch (error) {
                    console.error('Error fetching company statistics:', error)
                } finally {
                    setLoading(false)
                }
            }
        }
        fetchStats()
    }, [selectedCompany])

    const handleRefresh = async () => {
        if (selectedCompany?.id) {
            try {
                const response = await companyStatistics(selectedCompany.id)
                setStats({ ...response })
            } catch (error) {
                console.error('Error refreshing data:', error)
            }
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('he-IL', {
            style: 'currency',
            currency: 'ILS'
        }).format(amount)
    }

    const formatCurrencyShort = (amount) => {
        if (amount >= 1000000) {
            return `₪${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 100000) {
            return `₪${(amount / 1000).toFixed(0)}K`;
        }
        return `₪${amount.toLocaleString()}`;
    }

    const getCurrentMonthName = () => {
        const months = [
            'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
            'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
        ]
        return months[new Date().getMonth()]
    }

    const prepareAvgDaysLateData = () => {
        if (!stats) return []
        if (stats.avg_due_days_history && stats.avg_due_days_history.length > 0) {
            return stats.avg_due_days_history
        }
        return [{
            month: getCurrentMonthName(),
            avg_due_days: stats.avg_days_late || 0
        }]
    }

    const prepareClientCategoriesData = () => {
        if (!stats?.client_health_breakdown) return []
        return [
            { name: 'מצוינים', value: stats.client_health_breakdown.ok_clients_count || 0, color: '#00aa44' },
            { name: 'בינוניים', value: stats.client_health_breakdown.small_overdue_clients_count || 0, color: '#ffaa00' },
            { name: 'בעייתיים', value: stats.client_health_breakdown.large_overdue_clients_count || 0, color: '#ff4444' },
        ].filter(item => item.value > 0)
    }

    const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, percent, name }) => {
        const RADIAN = Math.PI / 180
        const radius = outerRadius + 20
        const x = cx + radius * Math.cos(-midAngle * RADIAN)
        const y = cy + radius * Math.sin(-midAngle * RADIAN)
        return (
            <text x={x} y={y} fill="#000" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${name} ${(percent * 100).toFixed(0)}%`}
            </text>
        )
    }

    const calcAmount = (amountWithVAT, include = true) => {
        if (include) return formatCurrency(amountWithVAT)
        return formatCurrency(amountWithVAT / 1.18)
    }

    const getAvailableYears = () => {
        if (!stats?.payments_history) return []
        return [...new Set(Object.keys(stats.payments_history).map(key => key.split('-')[0]))].sort()
    }

    const getPaymentsDataForYear = (year) => {
        if (!stats?.payments_history) return []
        return Object.entries(stats.payments_history)
            .filter(([key]) => key.startsWith(year))
            .map(([month, value]) => ({
                month: month.slice(5),
                amount: includeVAT ? value : value / 1.18
            }))
    }

    if (loading) return <div className="home-loading">טוען נתונים...</div>
    if (!stats) return <div className="home-loading">לא ניתן לטעון נתונים</div>

    const avgDaysLateData = prepareAvgDaysLateData()
    const clientCategoriesData = prepareClientCategoriesData()
    const availableYears = getAvailableYears()
    const paymentsData = getPaymentsDataForYear(selectedYear)
    const paymentsDomain = calculateDomain(paymentsData, 'amount')
    const totalIncomeForYear = paymentsData.reduce((sum, item) => sum + item.amount, 0)

    // Calculate domains for charts
    const avgDaysDomain = calculateDomain(avgDaysLateData, 'avg_due_days');

    const forecastData = stats.monthly_expected_income && Object.keys(stats.monthly_expected_income).length > 0 ?
        Object.entries(stats.monthly_expected_income).map(([month, value]) => ({
            month,
            expected_income: includeForecastVAT ? value : value / 1.18
        })) : [];
    const incomeDomain = calculateDomain(forecastData, 'expected_income');

    return (
        <div className="home-container">
            {userData.user.onboarding_status === "company_added" && <h4>
          עליך לעדכן פרטי התחברות לספק החשבוניות שלך לצורך הפעלת מערכת סוויפט
          </h4>}
            <div className="stats-block amounts-block">
                <h2 className="block-title">סכומים</h2>
                <div className="vat-toggle">
                    <label>
                        <input
                            type="checkbox"
                            checked={includeVAT}
                            onChange={() => setIncludeVAT(!includeVAT)}
                        />
                        הצג כולל מע"מ
                    </label>
                </div>
                <div className="amounts-grid">
                    <div className="amount-card total-waiting">
                        <h3>סה"כ ממתין לתשלום</h3>
                        <div className="amount-value">
                            {calcAmount(stats.total_waiting_payment || 0, includeVAT)}
                        </div>
                    </div>
                    <div className="amount-card late-payment">
                        <h3>סה"כ תשלום באיחור</h3>
                        <div className="amount-value">
                            {calcAmount(stats.total_late_payment || 0, includeVAT)}
                        </div>
                    </div>
                    <div className="amount-card not-late-payment">
                        <h3>סה"כ תשלום לא באיחור</h3>
                        <div className="amount-value">
                            {calcAmount(stats.total_not_late_payment || 0, includeVAT)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="stats-block numbers-block">
                <h2 className="block-title">במספרים</h2>
                <div className="numbers-grid">
                    <div className="number-card waiting-documents">
                        <h3>סה"כ מסמכים ממתינים לתשלום</h3>
                        <div className="number-value">
                            {stats.total_waiting_documents || 0}
                        </div>
                    </div>
                    <div className="number-card clients-in-process">
                        <h3>סה"כ לקוחות בתהליך גבייה</h3>
                        <div className="number-value">
                            {stats.total_clients_in_process || 0}
                        </div>
                    </div>
                </div>
            </div>

            <div className="stats-block avg-days-block">
                <h2 className="block-title">ימי איחור בממוצע</h2>
                <div className="avg-days-current">
                    <div className="current-avg-number">
                        {stats.avg_days_late || 0}
                    </div>
                    <div className="current-avg-label">ימים בממוצע</div>
                </div>
                <div className="avg-days-chart">
                    <h4>ימי איחור בממוצע לפי חודשים</h4>
                    {avgDaysLateData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={avgDaysLateData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis
                                    orientation="left"
                                    domain={avgDaysDomain}
                                    tick={{ dx: -20 }}
                                />
                                <Tooltip />
                                <Bar dataKey="avg_due_days" fill="#8884d8">
                                    <LabelList dataKey="avg_due_days" position="top" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div>אין נתונים היסטוריים להצגה</div>
                    )}
                </div>
                <div className="forecast-income-block">
                    <h4>הכנסות צפויות לפי חודשים קרובים</h4>
                    <div className="vat-toggle">
                        <label>
                            <input
                                type="checkbox"
                                checked={includeForecastVAT}
                                onChange={() => setIncludeForecastVAT(!includeForecastVAT)}
                            />
                            הצג כולל מע"מ
                        </label>
                    </div>
                    {stats.monthly_expected_income && Object.keys(stats.monthly_expected_income).length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={forecastData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis
                                    orientation="left"
                                    domain={incomeDomain}
                                    tick={{ dx: -35 }}
                                />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Bar dataKey="expected_income" fill="#82ca9d">
                                    <LabelList
                                        dataKey="expected_income"
                                        position="top"
                                        formatter={(value) => formatCurrencyShort(value)}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div>אין תחזית הכנסות זמינה</div>
                    )}
                </div>
            </div>

            <div className="stats-block clients-block">
                <h2 className="block-title">לקוחות</h2>
                <div className="clients-content">
                    <div className="problematic-clients">
                        <div className="vat-toggle">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={includeClientVAT}
                                    onChange={() => setIncludeClientVAT(!includeClientVAT)}
                                />
                                הצג כולל מע"מ
                            </label>
                        </div>
                        <h3>הלקוחות הכי בעייתיים</h3>
                        <div className="problematic-clients-list">
                            {stats.top_problematic_clients?.length > 0 ? (
                                stats.top_problematic_clients.map((client, index) => (
                                    <div key={client.client_id} className="problematic-client-item">
                                        <div className="client-rank">{index + 1}</div>
                                        <div className="client-name">{client.client__name}</div>
                                        <div className="client-debt">{calcAmount(client.total_late_amount || 0, includeClientVAT)}</div>
                                        <div className="client-days">ימי איחור: {client.worst_days_late || 0}</div>
                                    </div>
                                ))
                            ) : (
                                <div>אין לקוחות בעייתיים</div>
                            )}
                        </div>
                    </div>
                    <div className="clients-categories">
                        <h3>חלוקת לקוחות לקטגוריות</h3>
                        <div className="clients-pie-chart">
                            {clientCategoriesData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={clientCategoriesData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            labelLine
                                            label={renderCustomLabel}
                                            dataKey="value"
                                        >
                                            {clientCategoriesData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div>אין נתונים להצגה</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="stats-block">
                <h2 className="block-title">היסטוריית תשלומים לפי שנה</h2>
                <div className="vat-toggle">
                    <label>
                        <input
                            type="checkbox"
                            checked={includeVAT}
                            onChange={() => setIncludeVAT(!includeVAT)}
                        />
                        הצג כולל מע"מ
                    </label>
                </div>
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="year-select"
                >
                    {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>

                <div className="year-total">סה"כ הכנסה לשנה: {formatCurrency(totalIncomeForYear)}</div>

                {paymentsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={paymentsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis orientation="left" domain={paymentsDomain} tick={{ dx: -35 }} />
                            <Tooltip formatter={value => formatCurrency(value)} />
                            <Bar dataKey="amount" fill="#4287f5">
                                <LabelList dataKey="amount" position="top" formatter={value => formatCurrencyShort(value)} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div>אין נתוני תשלומים לשנה זו</div>
                )}
            </div>            
        </div>
    )
}

export default Home
