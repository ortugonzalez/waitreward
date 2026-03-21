import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const STORAGE_KEY = "wr_wallet_address";

export function useWallet() {
  const [address, setAddress]         = useState(() => localStorage.getItem(STORAGE_KEY) || null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Escuchar cambios de cuenta en MetaMask
  useEffect(() => {
    if (!window.ethereum) return;
    const handleChange = (accounts) => {
      if (accounts.length === 0) {
        setAddress(null);
        localStorage.removeItem(STORAGE_KEY);
      } else {
        setAddress(accounts[0]);
        localStorage.setItem(STORAGE_KEY, accounts[0]);
      }
    };
    window.ethereum.on("accountsChanged", handleChange);
    return () => window.ethereum.removeListener("accountsChanged", handleChange);
  }, []);

  const connect = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask no detectado. Instalalo en metamask.io");
      return;
    }
    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const addr = accounts[0];
      setAddress(addr);
      localStorage.setItem(STORAGE_KEY, addr);
      toast.success("Wallet conectada");
    } catch (err) {
      if (err.code === 4001) {
        toast.error("Conexión rechazada por el usuario");
      } else {
        toast.error("No se pudo conectar la wallet");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    localStorage.removeItem(STORAGE_KEY);
    toast("Wallet desconectada", { icon: "👋" });
  };

  return { address, connect, disconnect, isConnecting };
}
