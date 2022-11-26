
// double.cpp 
//  double型の浮動小数点数のメモリ格納状態を見る 
#include <math.h>     // 指数関数pow()を使う 

void dec2bin(double , int []); //１０進数の浮動小数点型を２進数に変換 
void bin2dec(int []);          //浮動小数点数の仮数部と指数部を１０進数に変換 

void utilFunc(double x) 
{ 
    printf("utilFunc(%f) (%.16f) (%lf)\n", x, x, x);
    int bit[64]; // ビットパターンを格納する 

    std::cout << " [指数部    ][ ---- 仮数部" <<  "----- ]" << std::endl; 

    dec2bin(x, bit);//  １０進→２進へ変換しbit[]に格納する 

    //std::.setf(std::ios::fixed, std::ios::floatfield); //固定小数点形式で表示 
    std::cout << "入力データ： " << x << " = "; 

    bin2dec(bit);//  仮数部と指数部の２進→１０進へ変換 
    printf("\n");
} 

//  １０進→２進へ変換して出力 
void dec2bin(double x, int bit[]) 
{ 
 // ビット演算は、整数型または文字型に対して使用しなければならないので、 
 // 共用体を使って浮動小数点型のデータを文字型（整数型）として参照する 
    union { 
        double   d;            // ８バイト（６４ビット）の領域 
        unsigned char c[8]; 
    } data; 

    data.d = x; //double型で代入 

    int i,j, k = 0; 
    for(i=7; i >= 0; i--) { //　文字型で１バイトごとに取り出す 
        unsigned char ch = data.c[i]; 
        for(j = 7; j >= 0; j--){//  １バイト単位で２進数に変換を行う 
           if( (ch >> j) & 1 ) 
                bit[k] = 1; 
           else 
                bit[k] = 0; 
            // ビットを出力 
            std::cout << bit[k]; 
            k++; 
        } 
        std::cout << " "; // １バイトごとに区切りを入れる 
    } 
    std::cout << std::endl; // 最後に改行 
} 

//  仮数部と指数部を２進→１０進へ変換して出力する 
void bin2dec(int bit[]) 
{ 
    const int BIAS = 1023; // 指数バイアス 
                           // 指数部は0～2047の値で表されている、この値から 
                           // BIASを引くことで、-1023～1024の範囲で 
                           // 本当の値が求まる 

    int    exponent = 0;         // 指数部 
    double fraction = 0.0;       // 仮数部の小数点以下 
    int    sign  = 1 - 2*bit[0]; //符号ビット０：正、１：負なので 
                                 // 0 -> 1  1 -> -1 となる 
    // 指数部を１０進整数に変換 
    int i; 
    for (i=11; i>=1; i--)   // 指数部は１１ビット 
        exponent += (int)(bit[i]*pow(2, 11-i)); 

     // 仮数部を１０進小数に変換 
    for (i=12; i<=63; i++)   // 仮数部は５２ビット 
        fraction += bit[i]*pow(2, 11-i); 

    std::cout.precision(12); //浮動小数点数の精度 
    std::cout << sign * (1.0 + fraction) << "x2^"  << ( exponent - BIAS ) << std::endl; 
 }