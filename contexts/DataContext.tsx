// contexts/DataContext.tsx
import { supabaseServices } from "../services/supabaseServices";


const refreshData = async () => {
  console.log("DataContext.refreshData: fetching all data...");
  const [products, low, users, transactions, todaysSales] = await Promise.all([
    supabaseServices.getProducts(),
    supabaseServices.getLowStock(),
    supabaseServices.getUsers(),
    supabaseServices.getTransactions(),
    supabaseServices.getTodaysSales(),
  ]);

  setState({ products, low, users, transactions, todaysSales });
  console.log("DataContext.refreshData: done", { products, low, users, transactions, todaysSales });
};


export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState(0);
  const [low, setLow] = useState(0);
  const [users, setUsers] = useState(0);
  const [transactions, setTransactions] = useState(0);
  const [todaysSales, setTodaysSales] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshData = async () => {
    console.log("DataContext.refreshData: fetching all data...");

    const [productsCount, lowStock, usersCount, transactionsCount, todaysSalesAmount, unread] =
      await Promise.all([
        SupabaseService.getProducts(),
        SupabaseService.getLowStock(),
        SupabaseService.getUsers(),
        SupabaseService.getTransactions(),
        SupabaseService.getTodaysSales(),
        SupabaseService.getUnreadCount(),
      ]);

    setProducts(productsCount ?? 0);
    setLow(lowStock ?? 0);
    setUsers(usersCount ?? 0);
    setTransactions(transactionsCount ?? 0);
    setTodaysSales(todaysSalesAmount ?? 0);
    setUnreadCount(unread ?? 0);

    console.log("DataContext.refreshData: done", {
      products: productsCount,
      low: lowStock,
      users: usersCount,
      transactions: transactionsCount,
      todaysSales: todaysSalesAmount,
      unread,
    });
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <DataContext.Provider
      value={{
        products,
        low,
        users,
        transactions,
        todaysSales,
        unreadCount,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used inside DataProvider");
  return context;
};
