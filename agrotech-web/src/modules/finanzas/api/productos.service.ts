import type { Producto, CreateProductoDTO } from "../model/types";
import { mapProductoFromApi, mapProductoToApi } from "../model/mappers";
import { api } from "@/shared/api/client";

class ProductoService {
  async listProductos(): Promise<Producto[]> {
    const { data } = await api.get("/productos");
    return Array.isArray(data) ? data.map(mapProductoFromApi) : [];
  }

  async getProductoById(id: number): Promise<Producto> {
    const { data } = await api.get(`/productos/${id}`);
    return mapProductoFromApi(data);
  }

  async createProducto(payload: CreateProductoDTO): Promise<Producto> {
    const { data } = await api.post("/productos", mapProductoToApi(payload));
    return mapProductoFromApi(data);
  }

  async updateProducto(id: number, payload: CreateProductoDTO): Promise<Producto> {
    const { data } = await api.patch(`/productos/${id}`, mapProductoToApi(payload));
    return mapProductoFromApi(data);
  }

  async removeProducto(id: number): Promise<boolean> {
    await api.delete(`/productos/${id}`);
    return true;
  }
}

export const productoService = new ProductoService();