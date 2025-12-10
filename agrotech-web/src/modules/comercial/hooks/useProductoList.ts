import { useEffect, useState } from "react";
import { productoService } from "../api/productos.service";
import type { Producto } from "../model/types";

interface UseProductoListReturn {
  productos: Producto[];
  loading: boolean;
  error: string | null;
}

export function useProductoList(): UseProductoListReturn {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProductos() {
      setLoading(true);
      try {
        const data = await productoService.listProductos();
        setProductos(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProductos();
  }, []);

  return { productos, loading, error };
}