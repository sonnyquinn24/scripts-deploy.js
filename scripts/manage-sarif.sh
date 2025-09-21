#!/bin/bash

# SARIF Management Script
# This script helps manage SARIF files in the sarif-output directory

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SARIF_DIR="$REPO_ROOT/sarif-output"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "SARIF Management Script"
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  list                    List all SARIF files"
    echo "  clean                   Clean old SARIF files (keeps last 10)"
    echo "  validate [file]         Validate SARIF file format"
    echo "  generate-sample         Generate sample SARIF files for testing"
    echo "  upload [file]           Upload specific SARIF file"
    echo "  help                    Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 list"
    echo "  $0 clean"
    echo "  $0 validate sarif-output/codeql/java-20240101-120000.sarif"
    echo "  $0 generate-sample"
}

# Function to list SARIF files
list_sarif_files() {
    print_info "Listing SARIF files in $SARIF_DIR"
    
    if [ ! -d "$SARIF_DIR" ]; then
        print_warning "SARIF directory does not exist: $SARIF_DIR"
        return 1
    fi
    
    local count=0
    
    find "$SARIF_DIR" -name "*.sarif" -type f | sort | while read -r file; do
        local rel_path="${file#$SARIF_DIR/}"
        local size=$(du -h "$file" | cut -f1)
        local date=$(stat -c %y "$file" 2>/dev/null || stat -f %Sm "$file" 2>/dev/null || echo "Unknown")
        
        echo "  📄 $rel_path ($size) - $date"
        count=$((count + 1))
    done
    
    local total_count=$(find "$SARIF_DIR" -name "*.sarif" -type f | wc -l)
    
    if [ "$total_count" -eq 0 ]; then
        print_warning "No SARIF files found"
    else
        print_success "Found $total_count SARIF files"
    fi
}

# Function to clean old SARIF files
clean_old_files() {
    print_info "Cleaning old SARIF files (keeping last 10 per category)"
    
    if [ ! -d "$SARIF_DIR" ]; then
        print_warning "SARIF directory does not exist: $SARIF_DIR"
        return 1
    fi
    
    # Clean each subdirectory separately
    for category_dir in "$SARIF_DIR"/*; do
        if [ -d "$category_dir" ]; then
            local category=$(basename "$category_dir")
            print_info "Cleaning category: $category"
            
            # Find SARIF files, sort by modification time, and remove all but the newest 10
            find "$category_dir" -name "*.sarif" -type f -print0 | \
                xargs -0 ls -t | \
                tail -n +11 | \
                while read -r old_file; do
                    print_info "Removing old file: $(basename "$old_file")"
                    rm -f "$old_file"
                done
        fi
    done
    
    print_success "Cleanup completed"
}

# Function to validate SARIF file
validate_sarif() {
    local file="$1"
    
    if [ -z "$file" ]; then
        print_error "Please specify a SARIF file to validate"
        return 1
    fi
    
    if [ ! -f "$file" ]; then
        print_error "File not found: $file"
        return 1
    fi
    
    print_info "Validating SARIF file: $file"
    
    # Basic JSON validation
    if command -v jq >/dev/null 2>&1; then
        if jq empty "$file" >/dev/null 2>&1; then
            print_success "Valid JSON format"
        else
            print_error "Invalid JSON format"
            return 1
        fi
        
        # Check for required SARIF fields
        if jq -e '.version' "$file" >/dev/null 2>&1; then
            local version=$(jq -r '.version' "$file")
            print_success "SARIF version: $version"
        else
            print_warning "No version field found"
        fi
        
        if jq -e '.runs[0]' "$file" >/dev/null 2>&1; then
            print_success "Has runs array"
        else
            print_warning "No runs array found"
        fi
        
        if jq -e '.runs[0].automationDetails.id' "$file" >/dev/null 2>&1; then
            local automation_id=$(jq -r '.runs[0].automationDetails.id' "$file")
            print_success "Automation ID: $automation_id"
        else
            print_warning "No automation ID found"
        fi
        
    else
        print_warning "jq not available, skipping detailed validation"
        # Basic file check
        if grep -q '"version"' "$file" && grep -q '"runs"' "$file"; then
            print_success "Basic SARIF structure detected"
        else
            print_error "Does not appear to be a valid SARIF file"
            return 1
        fi
    fi
}

# Function to generate sample SARIF files
generate_sample() {
    print_info "Generating sample SARIF files for testing"
    
    mkdir -p "$SARIF_DIR"/{codeql,apisec,other}
    
    local timestamp=$(date +'%Y%m%d-%H%M%S')
    
    # Generate sample CodeQL SARIF
    local codeql_file="$SARIF_DIR/codeql/sample-codeql-$timestamp.sarif"
    cat > "$codeql_file" << EOF
{
  "version": "2.1.0",
  "\$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
  "runs": [
    {
      "tool": {
        "driver": {
          "name": "CodeQL",
          "version": "2.15.0",
          "informationUri": "https://codeql.github.com"
        }
      },
      "automationDetails": {
        "id": "codeql-sample-$timestamp"
      },
      "results": [
        {
          "ruleId": "js/unused-local-variable",
          "message": {
            "text": "Unused local variable 'example'."
          },
          "locations": [
            {
              "physicalLocation": {
                "artifactLocation": {
                  "uri": "scripts/deploy.js"
                },
                "region": {
                  "startLine": 10,
                  "startColumn": 7
                }
              }
            }
          ]
        }
      ]
    }
  ]
}
EOF
    
    # Generate sample APIsec SARIF
    local apisec_file="$SARIF_DIR/apisec/sample-apisec-$timestamp.sarif"
    cat > "$apisec_file" << EOF
{
  "version": "2.1.0",
  "\$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
  "runs": [
    {
      "tool": {
        "driver": {
          "name": "APIsec",
          "version": "1.0.0",
          "informationUri": "https://www.apisec.ai"
        }
      },
      "automationDetails": {
        "id": "apisec-sample-$timestamp"
      },
      "results": [
        {
          "ruleId": "APISEC-001",
          "message": {
            "text": "API endpoint lacks proper authentication."
          },
          "locations": [
            {
              "physicalLocation": {
                "artifactLocation": {
                  "uri": "api/endpoints.js"
                },
                "region": {
                  "startLine": 25,
                  "startColumn": 1
                }
              }
            }
          ]
        }
      ]
    }
  ]
}
EOF
    
    print_success "Generated sample SARIF files:"
    print_success "  - $codeql_file"
    print_success "  - $apisec_file"
}

# Function to upload SARIF file
upload_sarif() {
    local file="$1"
    
    if [ -z "$file" ]; then
        print_error "Please specify a SARIF file to upload"
        return 1
    fi
    
    if [ ! -f "$file" ]; then
        print_error "File not found: $file"
        return 1
    fi
    
    print_info "Uploading SARIF file: $file"
    
    # This would typically use GitHub CLI or API
    if command -v gh >/dev/null 2>&1; then
        print_info "Using GitHub CLI to upload SARIF file"
        # Note: This is a placeholder - actual implementation would depend on repository context
        print_warning "GitHub CLI upload not implemented in this script"
        print_info "Please use the GitHub Actions workflow for automated uploads"
    else
        print_warning "GitHub CLI not available"
        print_info "Please use the GitHub Actions workflow for automated uploads"
    fi
}

# Main script logic
case "${1:-help}" in
    list)
        list_sarif_files
        ;;
    clean)
        clean_old_files
        ;;
    validate)
        validate_sarif "$2"
        ;;
    generate-sample)
        generate_sample
        ;;
    upload)
        upload_sarif "$2"
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac