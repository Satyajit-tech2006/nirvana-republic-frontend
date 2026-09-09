import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";
import { useStore } from "@/lib/store";
import { ShieldCheck, MapPin, Calendar, FileText, CheckCircle2 } from "lucide-react";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(ENDPOINTS.PRODUCTS.GET_BY_SLUG(slug!));
        if (data?.data) {
          setProduct(data.data);
          setSelectedImage(data.data.thumbnail || data.data.images[0]);
        }
      } catch (error) {
        console.error("Failed to load product details:", error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug]);

  if (loading) {
    return <div className="container-page py-24 text-center text-sm font-mono">Loading product origin...</div>;
  }

  if (!product) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-2xl">Product not found</h1>
        <Link to="/shop" className="mt-4 inline-block text-xs uppercase tracking-widest underline underline-offset-4">
          Return to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-12 md:py-20">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/5] overflow-hidden rounded-sm bg-secondary">
            <img src={selectedImage} alt={product.name} className="h-full w-full object-cover" />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-sm border ${
                    selectedImage === img ? "border-foreground" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Traceability */}
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-mono text-moss">{product.category}</p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl text-foreground">{product.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{product.tagline}</p>

          <div className="mt-6 flex items-baseline gap-4 border-y border-border py-4">
            <span className="font-display text-2xl">₹{product.price}</span>
            {product.compareAtPrice && (
              <span className="text-sm text-muted-foreground line-through">₹{product.compareAtPrice}</span>
            )}
            <span className="ml-auto text-xs font-mono text-muted-foreground">{product.weightGrams}g pouch</span>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          {/* Farm & Traceability Card */}
          <div className="mt-8 rounded-sm bg-secondary/60 p-5 border border-border space-y-3">
            <p className="text-xs uppercase tracking-wider font-mono text-foreground font-semibold">
              Traceability & Origin
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-moss shrink-0" />
                <span>Farm: {product.farmCluster?.name || "Verified Cluster"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-moss shrink-0" />
                <span>Harvest: {product.harvestPeriod}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-moss shrink-0" />
                <span>Lab Ref: {product.labReportRef}</span>
              </div>
              {product.labReportUrl && (
                <a
                  href={product.labReportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-foreground underline underline-offset-4 hover:text-moss"
                >
                  <FileText size={15} className="shrink-0" />
                  <span>View Lab Report PDF</span>
                </a>
              )}
            </div>
          </div>

          {/* Add to Bag Action */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border border-border rounded-sm">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-sm hover:bg-secondary"
              >
                -
              </button>
              <span className="w-10 text-center text-sm font-mono">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-sm hover:bg-secondary"
              >
                +
              </button>
            </div>
            <button
              onClick={() => addToCart({ ...product, id: product._id }, quantity)}
              className="flex-1 bg-foreground text-background py-3 text-xs uppercase tracking-widest font-medium hover:bg-foreground/90 transition-colors"
            >
              Add to Bag · ₹{product.price * quantity}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}