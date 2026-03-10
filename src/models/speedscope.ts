// https://github.com/jlfwong/speedscope/blob/main/src/lib/file-format-spec.ts

export interface SpeedscopeFrame {
  name: string;
  file?: string;
  line?: number;
  col?: number;
}

// Simplified since we don't need all of the fields
export interface SpeedscopeProfile {
  samples: number[][];
  weights: number[];
  name: string;
}

export interface SpeedscopeFile {
  shared: {
    frames: SpeedscopeFrame[];
  };
  profiles: SpeedscopeProfile[];
}
