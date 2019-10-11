import { Observable } from "rxjs";
import { ShiftCode } from "../types";

export interface CodeSource {
  observe: () => Observable<ShiftCode>;
}
