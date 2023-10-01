package cs.tuil;

import vmm.IVmmProcess;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;

public class MemoryTool {
    private IVmmProcess process;

    public MemoryTool(IVmmProcess process) {
        this.process = process;
    }

    public long getModuleAddress(String moduleName){

        return process.moduleGet(moduleName,true).getVaBase();
    }
    public long readAddress(long va,int size){
        return longFrom8Bytes(process.memRead(va,size),0,true);
    }
    public int readInt(long va,int size){
        return bytesToIntLittleEndian(process.memRead(va,size));
    }
    public float readFloat(long va,int size){
        return fromByteArray(process.memRead(va,size));
    }
    public static long longFrom8Bytes(byte[] input, int offset, boolean littleEndian){
        long value=0;
        // 循环读取每个字节通过移位运算完成long的8个字节拼装
        for(int  count=0;count<8;++count){
            int shift=(littleEndian?count:(7-count))<<3;
            value |=((long)0xff<< shift) & ((long)input[offset+count] << shift);
        }
        return value;
    }

    /*小端，低字节在后*/
    public static int bytesToIntLittleEndian(byte[] bytes) {
        // byte数组中序号小的在右边
        return bytes[0] & 0xFF |
                (bytes[1] & 0xFF) << 8 |
                (bytes[2] & 0xFF) << 16 |
                (bytes[3] & 0xFF) << 24;
    }

    float fromByteArray(byte[] bytes) {
        return ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN).getFloat();
    }

}
