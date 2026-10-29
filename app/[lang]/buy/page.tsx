import { ListingsShell, listingsMetadata } from "@/components/listings/ListingsShell";

export async function generateMetadata({ params }: PageProps<"/[lang]/buy">) {
  return listingsMetadata((await params).lang, "buy");
}

export default async function Page({ params }: PageProps<"/[lang]/buy">) {
  return <ListingsShell langParam={(await params).lang} kind="buy" />;
}
