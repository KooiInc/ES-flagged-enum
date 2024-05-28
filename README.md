# ES-flagged-enum
A module to create and use flagged enums in vanilla EcmaScript.

The module is programmed in a Class-free Object Oriented way. See:
* https://rosettacode.org/wiki/Classless-objects
* https://depth-first.com/articles/2019/03/04/class-free-object-oriented-programming/
* https://www.youtube.com/watch?v=XFTOG895C7c&t=2603s&ab_channel=FestGroup

The exported `enumFactory` creates either an empty flagged Enum or a flagged Enum from (an Array of) string(s).
The created Enum is in fact an empty proxified Object, using private (closed over) Objects.

Fork this little [Stackblitz project](https://stackblitz.com/edit/js-gxqsej?file=EnumFactory.js) or see [Demo](https://kooiinc.github.io/ES-flagged-enum/Demo)
