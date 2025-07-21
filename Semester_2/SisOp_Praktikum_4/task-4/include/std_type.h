#ifndef __STD_TYPE_H__
#define __STD_TYPE_H__

typedef unsigned char byte;

#ifndef bool
typedef char bool;
#define true 1
#define false 0
#endif

#ifndef NULL
#define NULL ((void*)0)
#endif

#endif /* __STD_TYPE_H__ */
