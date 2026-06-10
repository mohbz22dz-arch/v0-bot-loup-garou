import { PrismaClient } from '@prisma/client';
let prismaInstance = null;
export function getPrismaInstance() {
    if (!prismaInstance) {
        prismaInstance = new PrismaClient();
    }
    return prismaInstance;
}
export async function disconnectPrisma() {
    if (prismaInstance) {
        await prismaInstance.$disconnect();
        prismaInstance = null;
    }
}
//# sourceMappingURL=client.js.map