import { PrismaClient } from "@prisma/client"; 

const prismaClinetSingleton = () => {
    return new PrismaClient();
}

declare const globalThis:{
    PrismaGlobal: ReturnType<typeof prismaClinetSingleton>;

} & typeof global;

const prisma =globalThis.PrismaGlobal ?? prismaClinetSingleton()

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.PrismaGlobal = prisma;    
