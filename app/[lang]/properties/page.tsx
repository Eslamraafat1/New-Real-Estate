import { ListingsShell, listingsMetadata } from "@/components/listings/ListingsShell";

export async function generateMetadata({ params }: PageProps<"/[lang]/properties">) {
  return listingsMetadata((await params).lang, "all");
}

export default async function Page({ params }: PageProps<"/[lang]/properties">) {
  return <ListingsShell langParam={(await params).lang} kind="all" />;
}
